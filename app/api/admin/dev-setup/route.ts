import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { db } from '@/lib/prisma';

function generateId() {
  return 'c' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Endpoint disabled in production mode' },
      { status: 403 }
    );
  }

  try {
    const adminEmail = 'demo@admin.com'
    const adminPassword = 'demo@admin2025'
    const adminName = 'demo';

    const supabaseAdmin = await createAdminClient();

    // 1. Create or get Supabase Auth user
    let supabaseUserId = '';
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { name: adminName, role: 'SUPERADMIN' },
    });

    if (createError) {
      // If user exists, list users to get id
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      const existing = listData.users.find((u) => u.email === adminEmail);
      if (existing) {
        supabaseUserId = existing.id;
      }
    } else if (userData?.user) {
      supabaseUserId = userData.user.id;
    }

    if (!supabaseUserId) {
      supabaseUserId = `admin_${Date.now()}`;
    }

    // 2. Ensure AdminUser record in Prisma 8 database
    const existingAdmins = await db.orm.public.AdminUser.where({
      email: adminEmail,
    }).all();

    if (existingAdmins.length === 0) {
      await db.orm.public.AdminUser.create({
        id: generateId(),
        supabaseUserId,
        email: adminEmail,
        name: adminName,
        role: 'SUPERADMIN',
      });
    }

    return NextResponse.json({
      success: true,
      email: adminEmail,
      password: adminPassword,
    });
  } catch (error: any) {
    console.error('Error in dev-setup:', error);
    return NextResponse.json({ error: error.message || 'Setup error' }, { status: 500 });
  }
}
