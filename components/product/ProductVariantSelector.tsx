'use client';

import React from 'react';
import { content } from '@/config/content';
import { ProductLiveViewers } from './ProductSocialProof';
import { ProductVariantItem } from '@/lib/db/catalog';

interface ProductVariantSelectorProps {
  colors: string[];
  sizes: string[];
  variants: ProductVariantItem[];
  selectedColor: string | null;
  selectedSize: string | null;
  currentStock: number;
  isOutOfStock: boolean;
  isSocialProofEnabled: boolean;
  onSelectColor: (color: string) => void;
  onSelectSize: (size: string) => void;
}

export function ProductVariantSelector({
  colors,
  sizes,
  variants,
  selectedColor,
  selectedSize,
  currentStock,
  isOutOfStock,
  isSocialProofEnabled,
  onSelectColor,
  onSelectSize,
}: ProductVariantSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Color Selection */}
      {colors.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between text-xs tracking-wider">
            <span className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium">
              Colour
            </span>
            <span className="text-text-ondark/80">{selectedColor}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map((col) => {
              const isSelected = selectedColor === col;
              return (
                <button
                  key={col}
                  type="button"
                  onClick={() => onSelectColor(col)}
                  className={`px-4 py-2 text-xs border transition-all rounded-md cursor-pointer ${
                    isSelected
                      ? 'border-accent-brass bg-accent-brass text-bg-primary font-medium'
                      : 'border-hairline bg-bg-deep text-text-ondark/80 hover:border-accent-brass/50'
                  }`}
                >
                  {col}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size Selection */}
      {sizes.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between text-xs tracking-wider">
            <span className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium">
              Size
            </span>
            <span className="text-text-ondark/80">{selectedSize}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {sizes.map((sz) => {
              const isSelected = selectedSize === sz;
              const variantForStock = variants.find(
                (v) =>
                  v.size === sz &&
                  (colors.length === 0 || v.color === selectedColor)
              );
              const szOutOfStock = !variantForStock || variantForStock.stock <= 0;

              return (
                <button
                  key={sz}
                  type="button"
                  disabled={szOutOfStock}
                  onClick={() => onSelectSize(sz)}
                  className={`px-4 py-2 text-xs border transition-all rounded-md ${
                    isSelected
                      ? 'border-accent-brass bg-accent-brass text-bg-primary font-medium'
                      : szOutOfStock
                      ? 'border-hairline/40 text-text-ondark/25 line-through cursor-not-allowed bg-bg-deep/20'
                      : 'border-hairline bg-bg-deep text-text-ondark/80 hover:border-accent-brass/50 cursor-pointer'
                  }`}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Social Proof Live Viewers & Stock Indicator */}
      <div className="space-y-3 pt-1">
        <ProductLiveViewers enabled={isSocialProofEnabled} />

        <div className="text-xs flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              isOutOfStock
                ? 'bg-red-500'
                : currentStock <= 5
                ? 'bg-amber-400'
                : 'bg-emerald-500'
            }`}
          />
          <span className="text-text-ondark/70">
            {isOutOfStock
              ? content.shop.outOfStock
              : currentStock <= 5
              ? `Only ${currentStock} pieces remaining in stock`
              : 'In stock — ready to ship'}
          </span>
        </div>
      </div>
    </div>
  );
}
