'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { ContentProductItem } from '@/lib/db/content';
import { brandConfig } from '@/config/brand.config';

interface ProductLiveCopyPreviewProps {
  product: ContentProductItem;
  currentDescription: string;
}

export function ProductLiveCopyPreview({
  product,
  currentDescription,
}: ProductLiveCopyPreviewProps) {
  return (
    <div className="border border-hairline bg-bg-deep p-6 space-y-5 rounded-md shadow-sm">
      {/* Product Card Summary */}
      <div className="flex gap-4 items-start">
        <div className="relative h-20 w-16 bg-bg-primary shrink-0 border border-hairline overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-accent-brass">
              {product.category}
            </span>
            <Link
              href={`/product/${product.slug}`}
              target="_blank"
              className="text-[11px] text-accent-brass hover:underline flex items-center gap-1"
            >
              View PDP <ExternalLink size={12} />
            </Link>
          </div>
          <h3 className="font-serif text-lg text-text-ondark font-light truncate">
            {product.name}
          </h3>
          <p className="text-xs text-text-ondark/60 font-light">
            {brandConfig.currency.symbol}
            {product.basePrice.toLocaleString()} · Status: {product.status}
          </p>
        </div>
      </div>

      {/* Current Storefront Copy Card */}
      <div className="border-t border-hairline pt-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.2em] text-text-ondark/60 font-medium">
            Current Live PDP Description
          </span>
          {currentDescription ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20">
              <CheckCircle2 size={10} /> Active on Storefront
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 border border-amber-500/20">
              <AlertCircle size={10} /> Empty Description
            </span>
          )}
        </div>

        <div className="bg-bg-primary/80 border border-hairline p-4 min-h-[160px] text-xs text-text-ondark/80 font-light leading-relaxed whitespace-pre-line">
          {currentDescription || (
            <span className="italic text-text-ondark/40">
              This product does not currently have a published description. Generate one using the AI writing partner.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
