'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { AdminOrder } from './OrderListTable';

interface OrderFilterBarProps {
  orders: AdminOrder[];
  selectedStatus: string;
  searchQuery: string;
  onStatusChange: (status: string) => void;
  onSearchChange: (query: string) => void;
}

export function OrderFilterBar({
  orders,
  selectedStatus,
  searchQuery,
  onStatusChange,
  onSearchChange,
}: OrderFilterBarProps) {
  const statuses = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
        {statuses.map((st) => {
          const count =
            st === 'ALL'
              ? orders.length
              : orders.filter((o) => o.status === st).length;
          const isActive = selectedStatus === st;

          return (
            <button
              key={st}
              type="button"
              onClick={() => onStatusChange(st)}
              className={`px-3 py-1.5 text-xs uppercase tracking-wider transition-colors whitespace-nowrap flex items-center gap-2 border ${
                isActive
                  ? 'border-accent-brass bg-accent-brass/10 text-accent-brass font-medium'
                  : 'border-hairline text-text-ondark/60 hover:text-text-ondark hover:border-text-ondark/30'
              }`}
            >
              <span>{st}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-accent-brass/20 text-accent-brass' : 'bg-white/5 text-text-ondark/40'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative w-full md:w-64">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-ondark/40"
        />
        <input
          type="text"
          placeholder="Search order or customer..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-bg-deep border border-hairline pl-9 pr-4 py-1.5 text-xs text-text-ondark placeholder:text-text-ondark/30 focus:outline-none focus:border-accent-brass transition-colors"
        />
      </div>
    </div>
  );
}
