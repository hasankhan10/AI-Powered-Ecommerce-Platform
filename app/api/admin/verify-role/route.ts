import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin';
import { db } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const queryEmail = (req.nextUrl.searchParams.get('email') || '').trim().toLowerCase();
    if (queryEmail) {
      const allAdmins = await db.orm.public.AdminUser.all();
      const admin = allAdmins.find(
        (a) => a.email.trim().toLowerCase() === queryEmail
      );
      if (admin) {
        return NextResponse.json({
          success: true,
          admin: {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
          },
          role: admin.role,
        });
      }
      return NextResponse.json({ success: false, admin: null, role: 'CUSTOMER' });
    }

    const admin = await getAdminSession();
    if (admin) {
      return NextResponse.json({ success: true, admin, role: admin.role });
    }

    // Check if authenticated as regular customer
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Check AdminUser table for this user's email
      if (user.email) {
        const admins = await db.orm.public.AdminUser.where({ email: user.email }).all();
        if (admins.length > 0) {
          const a = admins[0];
          return NextResponse.json({
            success: true,
            admin: {
              id: a.id,
              email: a.email,
              name: a.name,
              role: a.role,
            },
            role: a.role,
          });
        }
      }
      return NextResponse.json({ success: false, admin: null, role: 'CUSTOMER' });
    }

    return NextResponse.json({ success: false, admin: null, role: 'ANONYMOUS' });
  } catch (error) {
    console.error('Error in verify-role GET:', error);
    return NextResponse.json({ success: false, admin: null, role: 'ANONYMOUS' });
  }
}

export async function POST(req: NextRequest) {
  try {
    let email = '';
    try {
      const body = await req.json();
      email = (body?.email || '').trim().toLowerCase();
    } catch {
      try {
        const text = await req.text();
        const parsed = JSON.parse(text);
        email = (parsed?.email || '').trim().toLowerCase();
      } catch {
        // Ignore
      }
    }

    if (email) {
      const allAdmins = await db.orm.public.AdminUser.all();
      const admin = allAdmins.find(
        (a) => a.email.trim().toLowerCase() === email
      );

      if (admin) {
        return NextResponse.json({
          success: true,
          admin: {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
          },
          role: admin.role,
        });
      }
      return NextResponse.json({ success: false, admin: null, role: 'CUSTOMER' });
    }

    return await GET(req);
  } catch (error) {
    console.error('Error in verify-role POST:', error);
    return NextResponse.json({ success: false, admin: null, role: 'ANONYMOUS' });
  }
}
