'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Check, ExternalLink } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';

export interface RecommendedProduct {
  id: string;
  name: string;
  slug: string;
  category?: string;
  basePrice: number;
  image?: string;
  description?: string;
  variants: Array<{
    id: string;
    sku: string;
    size?: string | null;
    color?: string | null;
    price: number;
    stock: number;
  }>;
}

interface AssistantProductCardProps {
  product: RecommendedProduct;
  onNavigate?: () => void;
}

export function AssistantProductCard({ product, onNavigate }: AssistantProductCardProps) {
  const { addItem, openCart } = useCartStore();
  const [selectedVariantId, setSelectedVariantId] = useState<string>(() => {
    // Find first variant that has stock > 0, or fallback to first
    const inStock = product.variants.find((v) => v.stock > 0);
    return inStock?.id || product.variants[0]?.id || '';
  });
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
  const isOutOfStock = !selectedVariant || selectedVariant.stock <= 0;
  const currentPrice = selectedVariant ? selectedVariant.price : product.basePrice;

  const handleAddToCart = () => {
    if (!selectedVariantId || isOutOfStock) return;
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);

    addItem(product.id, selectedVariantId, 1, {
      productName: product.name,
      productSlug: product.slug,
      price: currentPrice,
      imageUrl: product.image,
      size: selectedVariant?.size,
      color: selectedVariant?.color,
      stock: selectedVariant?.stock,
    });
  };

  return (
    <div className="rounded-md border border-hairline bg-bg-deep p-3 space-y-3 transition-colors hover:border-accent-brass/50 text-left my-2">
      <div className="flex gap-3">
        {/* Product Thumbnail */}
        <Link
          href={`/product/${product.slug}`}
          onClick={onNavigate}
          className="relative w-20 h-24 bg-bg-primary overflow-hidden rounded-md border border-hairline flex-shrink-0 group block"
        >
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="80px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[10px] text-text-ondark/40">
              Maison
            </div>
          )}
        </Link>

        {/* Product Details */}
        <div className="flex-1 min-w-0 space-y-1">
          {product.category && (
            <span className="text-[9px] uppercase tracking-[0.2em] text-accent-brass/80 block">
              {product.category}
            </span>
          )}
          <Link
            href={`/product/${product.slug}`}
            onClick={onNavigate}
            className="font-serif text-sm font-light text-text-ondark hover:text-accent-brass transition-colors line-clamp-1 block"
          >
            {product.name}
          </Link>

          <div className="flex items-center gap-2">
            <span className="font-serif text-xs text-text-ondark font-medium">
              ₹{currentPrice.toLocaleString('en-IN')}
            </span>
            {selectedVariant && selectedVariant.stock > 0 ? (
              <span className="text-[9px] text-emerald-400 font-sans tracking-wide">
                ● In Stock
              </span>
            ) : (
              <span className="text-[9px] text-rose-400 font-sans tracking-wide">
                ● Sold Out
              </span>
            )}
          </div>

          {/* Quick Variant Selection if multiple */}
          {product.variants.length > 1 && (
            <div className="pt-1">
              <select
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="w-full rounded-md bg-bg-primary border border-hairline text-[10px] text-text-ondark py-1 px-1.5 focus:outline-none focus:border-accent-brass cursor-pointer"
              >
                {product.variants.map((v) => {
                  const label = [v.color, v.size].filter(Boolean).join(' / ') || v.sku;
                  return (
                    <option key={v.id} value={v.id} disabled={v.stock <= 0}>
                      {label} {v.stock <= 0 ? '(Out of Stock)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1 border-t border-hairline/60">
        <button
          type="button"
          disabled={isOutOfStock || isAdding}
          onClick={handleAddToCart}
          className={`flex-1 py-1.5 px-2 rounded-md text-[10px] uppercase tracking-[0.15em] flex items-center justify-center gap-1.5 transition-colors border ${
            added
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              : isOutOfStock
              ? 'border-hairline text-text-ondark/30 cursor-not-allowed'
              : 'border-accent-brass bg-accent-brass/10 hover:bg-accent-brass hover:text-bg-primary text-accent-brass font-medium'
          }`}
        >
          {added ? (
            <>
              <Check size={12} />
              <span>Added</span>
            </>
          ) : (
            <>
              <ShoppingBag size={12} />
              <span>{isOutOfStock ? 'Sold Out' : isAdding ? 'Adding...' : 'Add to Cart'}</span>
            </>
          )}
        </button>

        <Link
          href={`/product/${product.slug}`}
          onClick={onNavigate}
          className="p-1.5 rounded-md border border-hairline hover:border-accent-brass text-text-ondark/60 hover:text-accent-brass transition-colors"
          title="View Piece Details"
        >
          <ExternalLink size={12} />
        </Link>
      </div>
    </div>
  );
}
