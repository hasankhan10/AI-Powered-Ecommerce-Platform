'use client';

import React from 'react';
import { ProductCard } from '@/components/product/ProductCard';
import { FormattedProduct } from '@/lib/db/homepage';
import { content } from '@/config/content';

interface RelatedProductsProps {
  products: FormattedProduct[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="w-full bg-bg-deep py-24 border-t border-hairline">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-12 space-y-2">
          <span className="text-[10px] uppercase tracking-[0.3em] text-accent-brass font-medium">
            Curated For You
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-light text-text-ondark tracking-tight">
            {content.product.youMayAlsoLike}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((item) => (
            <ProductCard
              key={item.id}
              id={item.id}
              name={item.name}
              slug={item.slug}
              categoryName={item.categoryName}
              price={item.minPrice}
              marketPrice={item.marketPrice}
              imageUrl={item.imageUrl}
              aspectRatio="portrait"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
