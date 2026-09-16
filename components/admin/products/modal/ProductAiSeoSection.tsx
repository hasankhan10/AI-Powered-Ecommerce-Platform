'use client';

import React from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

interface ProductAiSeoSectionProps {
  name: string;
  metaTitle: string;
  metaDescription: string;
  generatingSeo: boolean;
  onMetaTitleChange: (val: string) => void;
  onMetaDescriptionChange: (val: string) => void;
  onAutoGenerateSeo: () => void;
}

export function ProductAiSeoSection({
  name,
  metaTitle,
  metaDescription,
  generatingSeo,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onAutoGenerateSeo,
}: ProductAiSeoSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-hairline/60 pb-2">
        <h3 className="text-xs uppercase tracking-[0.2em] text-accent-brass font-medium flex items-center gap-1.5">
          <Sparkles size={13} /> 4. AI SEO & Metadata Optimization
        </h3>
        <button
          type="button"
          onClick={onAutoGenerateSeo}
          disabled={generatingSeo || !name}
          className="inline-flex items-center gap-1.5 text-[11px] text-accent-brass hover:underline disabled:opacity-40"
        >
          {generatingSeo ? (
            <>
              <RefreshCw size={11} className="animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles size={11} /> Auto-Generate SEO
            </>
          )}
        </button>
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-text-ondark/70">
            <label>Meta Title (Target 50–60 chars)</label>
            <span
              className={
                metaTitle.length >= 50 && metaTitle.length <= 60
                  ? 'text-emerald-400'
                  : 'text-text-ondark/40'
              }
            >
              {metaTitle.length}/60 chars
            </span>
          </div>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => onMetaTitleChange(e.target.value)}
            placeholder="Linen Cocoon Shirt — Handcrafted Luxury | Maison Vale"
            className="w-full border border-hairline bg-bg-deep px-3 py-2 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-text-ondark/70">
            <label>Meta Description (Target 150–160 chars)</label>
            <span
              className={
                metaDescription.length >= 150 && metaDescription.length <= 160
                  ? 'text-emerald-400'
                  : 'text-text-ondark/40'
              }
            >
              {metaDescription.length}/160 chars
            </span>
          </div>
          <textarea
            rows={2}
            value={metaDescription}
            onChange={(e) => onMetaDescriptionChange(e.target.value)}
            placeholder="Discover the Linen Cocoon Shirt at Maison Vale. Handcrafted from artisanal natural materials..."
            className="w-full border border-hairline bg-bg-deep px-3 py-2 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
