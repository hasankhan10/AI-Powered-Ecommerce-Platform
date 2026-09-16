'use client';

import React from 'react';
import { FilterOptions } from '@/lib/db/catalog';
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { content } from '@/config/content';

interface FilterSidebarProps {
  filterOptions: FilterOptions;
  selectedCategory?: string;
  selectedSize?: string;
  selectedColor?: string;
  selectedPriceMax?: number;
  onSelectCategory: (slug: string) => void;
  onSelectSize: (size: string | undefined) => void;
  onSelectColor: (color: string | undefined) => void;
  onSelectPriceMax: (max: number) => void;
  onResetFilters: () => void;
  activeFilterCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function FilterSidebar({
  filterOptions,
  selectedCategory = 'all',
  selectedSize,
  selectedColor,
  selectedPriceMax,
  onSelectCategory,
  onSelectSize,
  onSelectColor,
  onSelectPriceMax,
  onResetFilters,
  activeFilterCount,
  isMobileOpen,
  onCloseMobile,
}: FilterSidebarProps) {
  const contentBody = (
    <div className="space-y-8 text-text-ondark">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-hairline pb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-accent-brass" />
          <h3 className="text-xs uppercase tracking-[0.25em] font-medium text-text-ondark">
            {content.shop.filterLabel}
          </h3>
          {activeFilterCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center bg-accent-brass text-[9px] font-bold text-bg-primary rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-text-ondark/50 hover:text-accent-brass transition-colors rounded-md"
          >
            <RotateCcw size={10} />
            Reset
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h4 className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium">
          Category
        </h4>
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => onSelectCategory('all')}
            className={`text-left text-xs tracking-wider transition-colors flex items-center justify-between p-1 rounded-md ${
              selectedCategory === 'all'
                ? 'text-accent-brass font-medium'
                : 'text-text-ondark/70 hover:text-text-ondark'
            }`}
          >
            <span>All Categories</span>
          </button>
          {filterOptions.categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => onSelectCategory(cat.slug)}
              className={`text-left text-xs tracking-wider transition-colors flex items-center justify-between p-1 rounded-md ${
                selectedCategory === cat.slug
                  ? 'text-accent-brass font-medium'
                  : 'text-text-ondark/70 hover:text-text-ondark'
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-[10px] text-text-ondark/40">({cat.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sizes */}
      {filterOptions.sizes.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-hairline/60">
          <h4 className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium">
            Size
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {filterOptions.sizes.map((size) => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  onClick={() => onSelectSize(isSelected ? undefined : size)}
                  className={`px-3 py-1.5 text-[11px] border transition-colors rounded-md ${
                    isSelected
                      ? 'border-accent-brass bg-accent-brass text-bg-primary font-medium'
                      : 'border-hairline bg-bg-deep/50 text-text-ondark/70 hover:border-accent-brass/50'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Colors */}
      {filterOptions.colors.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-hairline/60">
          <h4 className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium">
            Colour
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {filterOptions.colors.map((col) => {
              const isSelected = selectedColor === col;
              return (
                <button
                  key={col}
                  onClick={() => onSelectColor(isSelected ? undefined : col)}
                  className={`px-3 py-1.5 text-[11px] border transition-colors rounded-md ${
                    isSelected
                      ? 'border-accent-brass bg-accent-brass text-bg-primary font-medium'
                      : 'border-hairline bg-bg-deep/50 text-text-ondark/70 hover:border-accent-brass/50'
                  }`}
                >
                  {col}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price Range Slider */}
      <div className="space-y-3 pt-2 border-t border-hairline/60">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em]">
          <span className="text-accent-brass font-medium">Max Price</span>
          <span className="text-text-ondark">
            ₹{(selectedPriceMax ?? filterOptions.maxPrice).toLocaleString('en-IN')}
          </span>
        </div>
        <input
          type="range"
          min={filterOptions.minPrice}
          max={filterOptions.maxPrice}
          step={500}
          value={selectedPriceMax ?? filterOptions.maxPrice}
          onChange={(e) => onSelectPriceMax(Number(e.target.value))}
          className="w-full accent-accent-brass bg-bg-deep cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-text-ondark/40 font-mono">
          <span>₹{filterOptions.minPrice.toLocaleString('en-IN')}</span>
          <span>₹{filterOptions.maxPrice.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 pr-8">
        <div className="sticky top-28 border border-hairline bg-bg-deep/80 backdrop-blur-md p-6 rounded-lg">
          {contentBody}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-bg-deep/80 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-bg-primary p-6 border-l border-hairline shadow-2xl">
            <button
              onClick={onCloseMobile}
              className="absolute top-5 right-5 text-text-ondark/60 hover:text-accent-brass"
            >
              <X size={20} />
            </button>
            <div className="mt-8">{contentBody}</div>
          </div>
        </div>
      )}
    </>
  );
}
