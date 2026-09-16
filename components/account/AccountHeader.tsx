'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, LogOut } from 'lucide-react';
import { content } from '@/config/content';

interface AccountHeaderProps {
  displayName: string;
  email: string;
  onSignOut: () => void;
}

export function AccountHeader({ displayName, email, onSignOut }: AccountHeaderProps) {
  return (
    <div className="border-b border-hairline pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-accent-brass font-medium">
            Patron Sanctuary
          </span>
          <span className="h-1 w-1 rounded-full bg-accent-brass/50" />
          <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-mono">
            Verified Member
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-text-ondark tracking-tight">
          Welcome, {displayName}
        </h1>
        <p className="text-xs text-text-ondark/60 font-light">
          Connected as <span className="font-mono text-text-ondark/90">{email}</span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/shop"
          className="px-5 py-2.5 bg-accent-brass text-bg-primary text-xs uppercase tracking-[0.2em] font-medium hover:bg-accent-brass-hover transition-colors rounded-md shadow-sm inline-flex items-center gap-2"
        >
          <ShoppingBag size={14} />
          <span>Explore Collection</span>
        </Link>

        <button
          type="button"
          onClick={onSignOut}
          className="px-4 py-2.5 border border-hairline text-text-ondark/70 hover:text-red-400 hover:border-red-500/40 text-xs uppercase tracking-wider transition-colors rounded-md inline-flex items-center gap-1.5"
        >
          <LogOut size={13} />
          <span>{content.nav.signOutLabel}</span>
        </button>
      </div>
    </div>
  );
}
