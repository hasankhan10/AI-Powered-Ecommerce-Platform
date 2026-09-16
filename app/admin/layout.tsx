import React from 'react';
import { requireAdmin } from '@/lib/auth/admin';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side authentication and role check
  const admin = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-bg-primary text-text-ondark">
      {/* Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <AdminHeader admin={admin} />
        <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto overflow-x-hidden min-w-0 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
