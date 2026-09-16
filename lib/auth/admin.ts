import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/prisma';

export interface AdminSession {
  id: string;
  email: string;
  name: string | null;
  role: 'SUPERADMIN' | 'ADMIN' | 'SUPPORT';
}

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user || !user.email) {
      return null;
    }

    const cleanEmail = user.email.trim().toLowerCase();

    // Look up AdminUser record with case-insensitive check
    const allAdmins = await db.orm.public.AdminUser.all();
    const admin = allAdmins.find(
      (a) => a.email.trim().toLowerCase() === cleanEmail
    );

    if (!admin) {
      return null;
    }

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role as 'SUPERADMIN' | 'ADMIN' | 'SUPPORT',
    };
  } catch (error) {
    console.error('Error verifying admin session:', error);
    return null;
  }
}

export async function requireAdmin(): Promise<AdminSession> {
  const admin = await getAdminSession();
  if (!admin) {
    redirect('/login?redirectTo=/admin');
  }
  return admin;
}
