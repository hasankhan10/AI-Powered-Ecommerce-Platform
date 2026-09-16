'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  TrendingUp,
  Boxes,
  FileText,
  Headphones,
  Settings,
  Store,
  X,
} from 'lucide-react';
import { brandConfig } from '@/config/brand.config';
import { useAdminSidebarStore } from '@/lib/store/useAdminSidebarStore';

const NAV_ITEMS = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'AI Analytics', href: '/admin/analytics', icon: TrendingUp },
  { label: 'Inventory Intelligence', href: '/admin/inventory', icon: Boxes },
  { label: 'AI Content & SEO', href: '/admin/content-seo', icon: FileText },
  { label: 'Customer Support', href: '/admin/support', icon: Headphones },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { isOpen, closeSidebar } = useAdminSidebarStore();

  // Auto-close sidebar on mobile when route changes
  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  const renderNavContent = () => (
    <div className="flex flex-col justify-between h-full">
      <div>
        {/* Brand Header */}
        <div className="p-5 sm:p-6 border-b border-hairline flex items-center justify-between">
          <Link href="/admin" onClick={closeSidebar} className="block">
            <span className="font-serif text-lg tracking-[0.15em] text-text-ondark block font-light">
              {brandConfig.name.toUpperCase()}
            </span>
            <span className="text-[9px] uppercase tracking-[0.3em] text-accent-brass font-medium">
              Operator Console
            </span>
          </Link>

          {/* Close button for mobile drawer */}
          <button
            type="button"
            onClick={closeSidebar}
            className="p-1.5 text-text-ondark/50 hover:text-text-ondark lg:hidden rounded-md transition-colors"
            aria-label="Close Sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 sm:p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs tracking-wider transition-colors rounded-md ${
                  isActive
                    ? 'border-l-2 border-accent-brass bg-bg-primary text-accent-brass font-medium'
                    : 'text-text-ondark/70 hover:bg-bg-primary/50 hover:text-text-ondark'
                }`}
              >
                <Icon
                  size={16}
                  className={isActive ? 'text-accent-brass shrink-0' : 'text-text-ondark/50 shrink-0'}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Return to Live Storefront button */}
      <div className="p-3 sm:p-4 border-t border-hairline">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2.5 px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs text-text-ondark/60 hover:text-accent-brass transition-colors rounded-md hover:bg-bg-primary/30"
        >
          <Store size={16} className="shrink-0" />
          <span className="truncate">View Live Storefront</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:min-h-screen lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto border-r border-hairline bg-bg-deep z-20">
        {renderNavContent()}
      </aside>

      {/* Mobile Off-Canvas Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
            onClick={closeSidebar}
          />

          {/* Drawer Sidebar Panel */}
          <aside className="relative z-10 w-72 max-w-[85vw] h-full bg-bg-deep border-r border-hairline flex flex-col justify-between overflow-y-auto shadow-2xl animate-in slide-in-from-left duration-300">
            {renderNavContent()}
          </aside>
        </div>
      )}
    </>
  );
}
