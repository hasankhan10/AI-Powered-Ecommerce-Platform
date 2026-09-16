'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, ShoppingBag, Check, Loader2 } from 'lucide-react';
import { brandConfig } from '@/config/brand.config';
import { content } from '@/config/content';
import { useCartStore } from '@/lib/store/useCartStore';

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  categoryName: string;
  price: number;
  marketPrice?: number | null;
  imageUrl: string;
  aspectRatio?: 'portrait' | 'tall' | 'square';
  showAddToCart?: boolean;
}

export function ProductCard({
  id,
  name,
  slug,
  categoryName,
  price,
  marketPrice,
  imageUrl,
  aspectRatio = 'portrait',
  showAddToCart = true,
}: ProductCardProps) {
  const { addItem } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const aspectClass =
    aspectRatio === 'tall'
      ? 'aspect-[3/5]'
      : aspectRatio === 'square'
      ? 'aspect-square'
      : 'aspect-[3/4]';

  const formattedPrice = new Intl.NumberFormat(brandConfig.currency.locale, {
    style: 'currency',
    currency: brandConfig.currency.code,
    maximumFractionDigits: 0,
  }).format(price);

  const hasDiscount = !!marketPrice && marketPrice > price;
  const discountPercent = hasDiscount ? Math.round(((marketPrice - price) / marketPrice) * 100) : null;
  const formattedMarketPrice = hasDiscount && marketPrice
    ? new Intl.NumberFormat(brandConfig.currency.locale, {
        style: 'currency',
        currency: brandConfig.currency.code,
        maximumFractionDigits: 0,
      }).format(marketPrice)
    : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);

    addItem(id, undefined, 1, {
      productName: name,
      productSlug: slug,
      price: price,
      imageUrl: imageUrl,
    });
  };

  return (
    <Link href={`/product/${slug}`} className="group block w-full">
      <div className="relative overflow-hidden rounded-md border border-hairline bg-bg-deep transition-all duration-300 hover:border-accent-brass/40 shadow-sm hover:shadow-xl flex flex-col h-full">
        {/* Image Container */}
        <div className={`relative w-full ${aspectClass} overflow-hidden bg-bg-primary/50`}>
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {/* Subtle gradient vignette on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-deep/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          
          {/* Quick View Corner Icon */}
          <div className="absolute top-3 right-3 hidden sm:flex h-7 w-7 items-center justify-center rounded-full border border-hairline bg-bg-primary/80 backdrop-blur-md text-text-ondark opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2">
            <ArrowUpRight size={13} className="text-accent-brass" />
          </div>
        </div>

        {/* Content Details */}
        <div className="p-3 sm:p-4 space-y-1 sm:space-y-1.5 bg-bg-deep flex-1 flex flex-col justify-between">
          <div>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-accent-brass font-medium line-clamp-1">
              {categoryName}
            </span>
            <h3 className="font-serif text-sm sm:text-base font-light text-text-ondark group-hover:text-accent-brass transition-colors duration-200 line-clamp-1">
              {name}
            </h3>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-[11px] sm:text-xs font-sans tracking-wider text-text-ondark/90 font-medium">
                {formattedPrice}
              </span>
              {hasDiscount && (
                <>
                  <span className="line-through text-text-ondark/40 text-[10px] sm:text-[11px] font-light">
                    {formattedMarketPrice}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-400">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Add to Cart CTA */}
          {showAddToCart && (
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdding}
              aria-label={`Add ${name} to cart`}
              className={`w-full mt-2.5 flex items-center justify-center gap-1.5 py-2 px-3 text-[10px] sm:text-xs uppercase tracking-[0.15em] font-medium rounded-md transition-all duration-200 shadow-sm ${
                isAdded
                  ? 'bg-emerald-600 text-text-ondark border border-emerald-500'
                  : 'bg-accent-brass/15 hover:bg-accent-brass text-accent-brass hover:text-bg-primary border border-accent-brass/30 hover:border-accent-brass'
              }`}
            >
              {isAdded ? (
                <>
                  <Check size={13} className="text-white shrink-0" />
                  <span>Added</span>
                </>
              ) : isAdding ? (
                <>
                  <Loader2 size={13} className="animate-spin shrink-0" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={13} className="shrink-0" />
                  <span>{content.shop.addToCart}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
}
