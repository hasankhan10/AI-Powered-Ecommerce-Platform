'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { CategoryQuickCreateBox } from './CategoryQuickCreateBox';

export interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductBasicDetailsSectionProps {
  name: string;
  slug: string;
  categoryId: string;
  basePrice: number;
  marketPrice: number | '';
  discountPercent: number | null;
  status: string;
  description: string;
  categoriesList: Category[];
  showNewCategoryModal: boolean;
  newCategoryName: string;
  creatingCategory: boolean;
  categoryError: string | null;
  onNameChange: (val: string) => void;
  onSlugChange: (val: string) => void;
  onCategoryChange: (id: string) => void;
  onBasePriceChange: (val: number) => void;
  onMarketPriceChange: (val: number | '') => void;
  onStatusChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onToggleNewCategoryModal: () => void;
  onNewCategoryNameChange: (val: string) => void;
  onCreateCategory: (e: React.FormEvent) => void;
}

export function ProductBasicDetailsSection({
  name,
  slug,
  categoryId,
  basePrice,
  marketPrice,
  discountPercent,
  status,
  description,
  categoriesList,
  showNewCategoryModal,
  newCategoryName,
  creatingCategory,
  categoryError,
  onNameChange,
  onSlugChange,
  onCategoryChange,
  onBasePriceChange,
  onMarketPriceChange,
  onStatusChange,
  onDescriptionChange,
  onToggleNewCategoryModal,
  onNewCategoryNameChange,
  onCreateCategory,
}: ProductBasicDetailsSectionProps) {
  const parsedMarketPrice = typeof marketPrice === 'number' ? marketPrice : parseFloat(marketPrice as string) || 0;

  return (
    <div className="space-y-4">
      <h3 className="text-xs uppercase tracking-[0.2em] text-accent-brass font-medium border-b border-hairline/60 pb-2">
        1. Basic Details
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
            Product Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Linen Cocoon Shirt"
            className="w-full border border-hairline bg-bg-deep px-3 py-2.5 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
            URL Slug *
          </label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => onSlugChange(e.target.value)}
            placeholder="linen-cocoon-shirt"
            className="w-full border border-hairline bg-bg-deep px-3 py-2.5 text-xs font-mono text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none"
          />
        </div>
      </div>

      {/* Category selection & Inline Category Creator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
            Category *
          </label>
          <button
            type="button"
            onClick={onToggleNewCategoryModal}
            className="inline-flex items-center gap-1 text-[11px] text-accent-brass hover:text-accent-brass-hover transition-colors font-medium"
          >
            <Plus size={12} />
            <span>{showNewCategoryModal ? 'Close Category Form' : '+ Create New Category'}</span>
          </button>
        </div>

        {/* Inline Category Quick Create */}
        <CategoryQuickCreateBox
          isOpen={showNewCategoryModal}
          categoryName={newCategoryName}
          creating={creatingCategory}
          error={categoryError}
          onNameChange={onNewCategoryNameChange}
          onClose={onToggleNewCategoryModal}
          onSubmit={onCreateCategory}
        />

        <select
          value={categoryId}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full border border-hairline bg-bg-deep px-3 py-2.5 text-xs text-text-ondark focus:border-accent-brass focus:outline-none cursor-pointer"
        >
          {categoriesList.length === 0 ? (
            <option value="">No categories found — create one first</option>
          ) : (
            categoriesList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.slug})
              </option>
            ))
          )}
        </select>
      </div>

      {/* Pricing and Status Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
        <div className="space-y-1">
          <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
            Base Price (₹) *
          </label>
          <input
            type="number"
            required
            min="0"
            value={basePrice || ''}
            onChange={(e) => onBasePriceChange(Number(e.target.value))}
            placeholder="4800"
            className="w-full border border-hairline bg-bg-deep px-3 py-2.5 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none font-mono"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
              Market Price (₹)
            </label>
            {discountPercent && (
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-500/30">
                {discountPercent}% OFF
              </span>
            )}
          </div>
          <input
            type="number"
            min="0"
            value={marketPrice}
            onChange={(e) => onMarketPriceChange(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="e.g. 6500 (Strike-through MRP)"
            className="w-full border border-hairline bg-bg-deep px-3 py-2.5 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none font-mono"
          />
          <p className="text-[10px] text-text-ondark/40 font-light">
            {discountPercent
              ? `Storefront shows: ~~₹${parsedMarketPrice}~~ ₹${basePrice} (${discountPercent}% discount badge)`
              : 'Optional MRP. If set higher than Base Price, shows cut price with % discount.'}
          </p>
        </div>

        <div className="space-y-1">
          <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full border border-hairline bg-bg-deep px-3 py-2.5 text-xs text-text-ondark focus:border-accent-brass focus:outline-none cursor-pointer"
          >
            <option value="ACTIVE">ACTIVE (Storefront Visible)</option>
            <option value="DRAFT">DRAFT (Hidden)</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
          Editorial Description
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="A considered piece cut from handwoven Pondicherry linen..."
          className="w-full border border-hairline bg-bg-deep px-3 py-2 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none"
        />
      </div>
    </div>
  );
}
