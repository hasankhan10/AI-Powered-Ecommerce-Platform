'use client';

import React from 'react';
import { Package, User, MapPin, Lock, ChevronRight } from 'lucide-react';
import { content } from '@/config/content';

export type AccountTabKey = 'orders' | 'profile' | 'addresses' | 'security';

interface AccountSidebarNavProps {
  activeTab: AccountTabKey;
  onSelectTab: (tab: AccountTabKey) => void;
}

export function AccountSidebarNav({ activeTab, onSelectTab }: AccountSidebarNavProps) {
  const tabs = [
    { key: 'orders' as const, label: content.account.ordersLabel, icon: Package },
    { key: 'profile' as const, label: content.account.profileLabel, icon: User },
    { key: 'addresses' as const, label: 'Saved Addresses', icon: MapPin },
    { key: 'security' as const, label: 'Password & Security', icon: Lock },
  ];

  return (
    <div className="lg:col-span-3 space-y-2">
      <div className="border border-hairline bg-bg-deep p-2 rounded-lg space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onSelectTab(tab.key)}
              className={`w-full flex items-center justify-between p-3 rounded-md text-xs tracking-wider transition-all text-left ${
                isActive
                  ? 'bg-accent-brass/15 text-accent-brass font-medium border border-accent-brass/30'
                  : 'text-text-ondark/70 hover:text-text-ondark hover:bg-bg-primary/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={15} />
                <span>{tab.label}</span>
              </div>
              <ChevronRight size={13} className="opacity-50" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
