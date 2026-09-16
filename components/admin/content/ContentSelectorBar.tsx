'use client';

import React from 'react';
import { Layers, Sliders, Sparkles } from 'lucide-react';
import { ContentProductItem } from '@/lib/db/content';
import { CopyTone, TONE_DEFINITIONS } from '@/lib/ai/copywriter';
import { brandConfig } from '@/config/brand.config';

interface ContentSelectorBarProps {
  products: ContentProductItem[];
  selectedProductId: string;
  selectedTone: CopyTone;
  onProductChange: (productId: string) => void;
  onToneChange: (tone: CopyTone) => void;
}

export function ContentSelectorBar({
  products,
  selectedProductId,
  selectedTone,
  onProductChange,
  onToneChange,
}: ContentSelectorBarProps) {
  return (
    <div className="border border-hairline bg-bg-deep p-4 sm:p-6 rounded-md shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Product Picker */}
        <div className="lg:col-span-6 space-y-2">
          <label className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium flex items-center gap-2">
            <Layers size={14} /> Select Product to Write
          </label>
          <div className="relative">
            <select
              value={selectedProductId}
              onChange={(e) => onProductChange(e.target.value)}
              className="w-full appearance-none bg-bg-primary border border-hairline px-4 py-3 text-sm text-text-ondark focus:border-accent-brass focus:outline-none transition-colors"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id} className="bg-bg-primary text-text-ondark">
                  {p.name} ({p.category}) — {brandConfig.currency.symbol}{p.basePrice}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tone Selector */}
        <div className="lg:col-span-6 space-y-2">
          <label className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium flex items-center gap-2">
            <Sliders size={14} /> Copywriting Tone
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['editorial', 'minimal', 'playful'] as CopyTone[]).map((tone) => {
              const isSelected = selectedTone === tone;
              return (
                <button
                  key={tone}
                  type="button"
                  onClick={() => onToneChange(tone)}
                  className={`py-2.5 px-3 text-center text-xs transition-all border ${
                    isSelected
                      ? 'border-accent-brass bg-accent-brass/15 text-accent-brass font-medium shadow-sm'
                      : 'border-hairline bg-bg-primary/60 text-text-ondark/70 hover:border-text-ondark/30 hover:text-text-ondark'
                  }`}
                >
                  <span className="capitalize block">{tone}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tone Description Subtitle */}
      <div className="mt-4 pt-4 border-t border-hairline flex items-center justify-between text-xs text-text-ondark/60 font-light">
        <p>
          <strong className="text-text-ondark font-normal capitalize">{selectedTone} Tone:</strong>{' '}
          {TONE_DEFINITIONS[selectedTone].description}
        </p>
        <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-accent-brass/90">
          <Sparkles size={12} /> Powered by Google Gemini 2.5 Flash
        </span>
      </div>
    </div>
  );
}
