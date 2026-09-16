'use client';

import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export interface ProductVariantForm {
  id?: string;
  sku?: string;
  size: string;
  color: string;
  price: number;
  stock: number;
}

interface ProductVariantsSectionProps {
  variants: ProductVariantForm[];
  basePrice: number;
  onAddVariant: () => void;
  onUpdateVariant: (index: number, field: keyof ProductVariantForm, val: any) => void;
  onRemoveVariant: (index: number) => void;
}

export function ProductVariantsSection({
  variants,
  basePrice,
  onAddVariant,
  onUpdateVariant,
  onRemoveVariant,
}: ProductVariantsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-hairline/60 pb-2">
        <h3 className="text-xs uppercase tracking-[0.2em] text-accent-brass font-medium">
          3. Variant Matrix & Stock Levels
        </h3>
        <button
          type="button"
          onClick={onAddVariant}
          className="inline-flex items-center gap-1 text-[11px] text-accent-brass hover:underline"
        >
          <Plus size={12} /> Add Variant
        </button>
      </div>

      <div className="border border-hairline overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[500px]">
          <thead>
            <tr className="border-b border-hairline bg-bg-deep text-[10px] uppercase tracking-wider text-text-ondark/50">
              <th className="p-3 font-medium">Size</th>
              <th className="p-3 font-medium">Colour</th>
              <th className="p-3 font-medium">SKU (Optional)</th>
              <th className="p-3 font-medium">Price (₹)</th>
              <th className="p-3 font-medium">Stock Quantity</th>
              <th className="p-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {variants.map((v, idx) => (
              <tr key={idx} className="hover:bg-bg-primary/20">
                <td className="p-2">
                  <input
                    type="text"
                    value={v.size}
                    onChange={(e) => onUpdateVariant(idx, 'size', e.target.value)}
                    placeholder="M"
                    className="w-20 border border-hairline bg-bg-primary px-2 py-1 text-xs text-text-ondark"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={v.color}
                    onChange={(e) => onUpdateVariant(idx, 'color', e.target.value)}
                    placeholder="Natural"
                    className="w-24 border border-hairline bg-bg-primary px-2 py-1 text-xs text-text-ondark"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={v.sku || ''}
                    onChange={(e) => onUpdateVariant(idx, 'sku', e.target.value)}
                    placeholder="MV-AUTO"
                    className="w-32 border border-hairline bg-bg-primary px-2 py-1 text-xs font-mono text-text-ondark/80"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    min="0"
                    value={v.price || basePrice}
                    onChange={(e) => onUpdateVariant(idx, 'price', Number(e.target.value))}
                    className="w-24 border border-hairline bg-bg-primary px-2 py-1 text-xs text-text-ondark font-mono"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    min="0"
                    value={v.stock}
                    onChange={(e) => onUpdateVariant(idx, 'stock', Number(e.target.value))}
                    className={`w-20 border px-2 py-1 text-xs font-mono ${
                      v.stock === 0
                        ? 'border-red-500/50 bg-red-950/20 text-red-300'
                        : 'border-hairline bg-bg-primary text-text-ondark'
                    }`}
                  />
                </td>
                <td className="p-2 text-right">
                  <button
                    type="button"
                    onClick={() => onRemoveVariant(idx)}
                    disabled={variants.length <= 1}
                    className="text-text-ondark/40 hover:text-red-400 disabled:opacity-20 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-text-ondark/40 font-light">
        Setting variant stock to 0 immediately disables that combination on the customer product detail page.
      </p>
    </div>
  );
}
