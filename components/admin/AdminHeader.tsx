'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, UserCheck, Menu } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { AdminSession } from '@/lib/auth/admin';
import { useAdminSidebarStore } from '@/lib/store/useAdminSidebarStore';

interface AdminHeaderProps {
  admin: AdminSession;
}

export function AdminHeader({ admin }: AdminHeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const { toggleSidebar } = useAdminSidebarStore();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="h-16 w-full border-b border-hairline bg-bg-primary px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0">
      {/* Left side: Mobile Toggle & System Status */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-2 -ml-2 text-text-ondark/70 hover:text-accent-brass hover:bg-bg-deep lg:hidden rounded-md transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        {/* System Status indicator */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs uppercase tracking-[0.2em] text-text-ondark/50">
            Status:
          </span>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden xs:inline">System Online</span>
          </div>
        </div>
      </div>

      {/* Right side: Admin Profile & Sign Out */}
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Admin profile */}
        <div className="flex items-center gap-2.5 sm:gap-3 text-xs">
          <div className="flex h-8 w-8 items-center justify-center border border-hairline bg-bg-deep text-accent-brass rounded-full shrink-0">
            <UserCheck size={15} />
          </div>
          <div className="flex flex-col max-w-[120px] sm:max-w-[200px] truncate">
            <span className="text-text-ondark font-medium truncate text-xs">
              {admin.name || admin.email}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-accent-brass">
              {admin.role}
            </span>
          </div>
        </div>

        {/* Sign Out */}
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-1.5 sm:gap-2 border border-hairline bg-bg-deep px-2.5 py-1.5 sm:px-3 text-xs text-text-ondark/70 hover:text-red-400 hover:border-red-500/30 transition-colors rounded-md shrink-0"
          title="Sign Out"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
