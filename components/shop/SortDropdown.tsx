'use client';

import React from 'react';
import { content } from '@/config/content';

interface SortDropdownProps {
  value: 'newest' | 'price_asc' | 'price_desc';
  onChange: (sort: 'newest' | 'price_asc' | 'price_desc') => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-[10px] uppercase tracking-[0.2em] text-text-ondark/60 hidden sm:inline">
        {content.shop.sortLabel}:
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as any)}
        className="border border-hairline bg-bg-deep px-3 py-2 text-xs text-text-ondark focus:border-accent-brass focus:outline-none transition-colors cursor-pointer rounded-md"
      >
        <option value="newest">{content.shop.sortOptions.newest}</option>
        <option value="price_asc">{content.shop.sortOptions.priceLow}</option>
        <option value="price_desc">{content.shop.sortOptions.priceHigh}</option>
      </select>
    </div>
  );
}
