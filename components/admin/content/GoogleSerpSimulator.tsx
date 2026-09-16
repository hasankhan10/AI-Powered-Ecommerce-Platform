'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Monitor, Smartphone, Code, ExternalLink } from 'lucide-react';
import { brandConfig } from '@/config/brand.config';
import { ContentProductItem } from '@/lib/db/content';

interface GoogleSerpSimulatorProps {
  product: ContentProductItem | undefined;
  metaTitle: string;
  metaDescription: string;
  slug: string;
  onOpenJsonLd: () => void;
}

export function GoogleSerpSimulator({
  product,
  metaTitle,
  metaDescription,
  slug,
  onOpenJsonLd,
}: GoogleSerpSimulatorProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div className="border border-hairline bg-bg-deep p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-hairline pb-3">
        <div className="flex items-center gap-2">
          <Search size={15} className="text-accent-brass" />
          <span className="text-xs font-serif text-text-ondark tracking-wide">
            Google SERP Snippet Preview
          </span>
        </div>
        {/* Desktop vs Mobile Toggle */}
        <div className="flex items-center border border-hairline p-0.5 bg-bg-primary">
          <button
            type="button"
            onClick={() => setViewMode('desktop')}
            className={`p-1.5 transition-colors cursor-pointer ${
              viewMode === 'desktop'
                ? 'bg-accent-brass/20 text-accent-brass'
                : 'text-text-ondark/50 hover:text-text-ondark'
            }`}
            title="Desktop Preview"
          >
            <Monitor size={14} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('mobile')}
            className={`p-1.5 transition-colors cursor-pointer ${
              viewMode === 'mobile'
                ? 'bg-accent-brass/20 text-accent-brass'
                : 'text-text-ondark/50 hover:text-text-ondark'
            }`}
            title="Mobile Preview"
          >
            <Smartphone size={14} />
          </button>
        </div>
      </div>

      {/* Google Search Result Card Mockup */}
      <div
        className={`border border-hairline/60 bg-[#202124] p-4 text-left transition-all ${
          viewMode === 'mobile' ? 'max-w-[340px] mx-auto rounded-lg' : 'rounded-sm'
        }`}
      >
        {/* Site URL & Breadcrumb */}
        <div className="flex items-center gap-2 mb-1 text-[11px] text-[#bdc1c6]">
          <div className="h-4 w-4 rounded-full bg-accent-brass/30 flex items-center justify-center text-[9px] text-accent-brass font-bold">
            M
          </div>
          <div className="truncate">
            <span className="text-[#dadce0] font-normal">{brandConfig.name}</span>
            <span className="text-[#9aa0a6] mx-1">›</span>
            <span className="text-[#9aa0a6]">product › {slug || product?.slug}</span>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-[#8ab4f8] hover:underline text-sm md:text-base font-normal leading-snug cursor-pointer line-clamp-2">
          {metaTitle || `${product?.name} — ${brandConfig.name}`}
        </h4>

        {/* Description snippet */}
        <p className="text-[#bdc1c6] text-xs font-light leading-relaxed mt-1 line-clamp-2">
          {metaDescription ||
            product?.description ||
            brandConfig.seo.defaultDescription}
        </p>

        {/* Rich snippet badges */}
        <div className="mt-2.5 pt-2 border-t border-[#3c4043] flex items-center gap-3 text-[10px] text-[#9aa0a6]">
          <span>★★★★★ 4.9 (19)</span>
          <span>·</span>
          <span>
            {brandConfig.currency.symbol}
            {product?.basePrice?.toLocaleString()}
          </span>
          <span>·</span>
          <span className="text-emerald-400">In stock</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pt-2 flex items-center justify-between text-xs text-text-ondark/60">
        <button
          type="button"
          onClick={onOpenJsonLd}
          className="hover:text-accent-brass flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Code size={13} className="text-accent-brass" /> Inspect JSON-LD Schema
        </button>
        <Link
          href={`/product/${product?.slug}`}
          target="_blank"
          className="hover:text-accent-brass flex items-center gap-1 transition-colors"
        >
          View Live PDP <ExternalLink size={12} />
        </Link>
      </div>
    </div>
  );
}
