'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { FormattedProduct } from '@/lib/db/homepage';
import { content } from '@/config/content';

interface NewArrivalsProps {
  products: FormattedProduct[];
}

export function NewArrivals({ products }: NewArrivalsProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="w-full bg-bg-primary py-24 border-b border-hairline">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 space-y-4 md:space-y-0 border-b border-hairline/60 pb-8">
          <div className="space-y-2">
            <span className="text-[11px] uppercase tracking-[0.3em] text-accent-brass font-medium">
              {content.home.newArrivals.eyebrow}
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-text-ondark tracking-tight">
              {content.home.newArrivals.headline}
            </h2>
          </div>

          <Link
            href="/shop"
            className="group flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-text-ondark/80 hover:text-accent-brass transition-colors"
          >
            {content.home.newArrivals.cta}
            <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Premium Aligned Product Grid - 2 columns on mobile, 3 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 lg:gap-10">
          {products.map((product) => (
            <div key={product.id} className="w-full">
              <ProductCard
                id={product.id}
                name={product.name}
                slug={product.slug}
                categoryName={product.categoryName}
                price={product.minPrice}
                marketPrice={product.marketPrice}
                imageUrl={product.imageUrl}
                aspectRatio="portrait"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
