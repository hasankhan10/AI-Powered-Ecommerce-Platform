'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Layers, ArrowUpRight } from 'lucide-react';
import { CollectionWithProducts } from '@/lib/db/catalog';
import { ProductCard } from '@/components/product/ProductCard';
import { brandConfig } from '@/config/brand.config';

interface CollectionsClientProps {
  collections: CollectionWithProducts[];
}

export function CollectionsClient({ collections }: CollectionsClientProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filteredCollections =
    activeFilter === 'all'
      ? collections
      : collections.filter((c) => c.slug === activeFilter);

  const totalProducts = collections.reduce((acc, c) => acc + c.productCount, 0);

  return (
    <div className="w-full bg-bg-primary min-h-screen py-12 lg:py-16 text-text-ondark">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Page Header */}
        <div className="border-b border-hairline pb-10 mb-12 space-y-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-accent-brass font-medium">
            <Layers size={14} />
            <span>The House Archives</span>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="font-serif text-4xl md:text-6xl font-light tracking-tight text-text-ondark">
                Curated Collections
              </h1>
              <p className="text-xs md:text-sm text-text-ondark/70 font-light max-w-xl leading-relaxed">
                Explore our deliberate collections — from handloomed breathable linens and Mulberry silks to architectural home accents crafted for mindful living.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-text-ondark/50 shrink-0">
              <span className="px-3 py-1.5 border border-hairline bg-bg-deep rounded-md">
                {collections.length} Curated Universes
              </span>
              <span className="px-3 py-1.5 border border-hairline bg-bg-deep rounded-md">
                {totalProducts} Handcrafted Pieces
              </span>
            </div>
          </div>
        </div>

        {/* Quick Filter Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-16 no-scrollbar">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 text-xs uppercase tracking-[0.2em] transition-all rounded-md shrink-0 border ${
              activeFilter === 'all'
                ? 'border-accent-brass bg-accent-brass text-bg-primary font-medium shadow-sm'
                : 'border-hairline bg-bg-deep/60 text-text-ondark/70 hover:border-accent-brass/50 hover:text-text-ondark'
            }`}
          >
            All Collections ({totalProducts})
          </button>
          {collections.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.slug)}
              className={`px-4 py-2 text-xs uppercase tracking-[0.2em] transition-all rounded-md shrink-0 border ${
                activeFilter === cat.slug
                  ? 'border-accent-brass bg-accent-brass text-bg-primary font-medium shadow-sm'
                  : 'border-hairline bg-bg-deep/60 text-text-ondark/70 hover:border-accent-brass/50 hover:text-text-ondark'
              }`}
            >
              {cat.name} ({cat.productCount})
            </button>
          ))}
        </div>

        {/* Collections Stack */}
        <div className="space-y-24">
          {filteredCollections.map((col, idx) => {
            const formattedMinPrice = new Intl.NumberFormat(
              brandConfig.currency.locale,
              {
                style: 'currency',
                currency: brandConfig.currency.code,
                maximumFractionDigits: 0,
              }
            ).format(col.minPrice);

            return (
              <div
                key={col.id}
                className="space-y-8 border-b border-hairline pb-20 last:border-b-0 last:pb-0"
              >
                {/* Collection Feature Header Banner */}
                <div className="relative w-full overflow-hidden rounded-lg border border-hairline bg-bg-deep">
                  <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
                    {/* Editorial Image Showcase */}
                    <div className="lg:col-span-6 relative aspect-[16/9] lg:aspect-[4/3] w-full overflow-hidden">
                      <Image
                        src={col.imageUrl || 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&q=80'}
                        alt={col.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover object-center grayscale hover:grayscale-0 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg-deep/90 via-bg-deep/30 to-transparent lg:hidden" />
                    </div>

                    {/* Editorial Details & CTA */}
                    <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 space-y-6 flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-[0.3em] text-accent-brass font-medium">
                            Universe 0{idx + 1}
                          </span>
                          <span className="text-text-ondark/30 font-mono text-[10px]">•</span>
                          <span className="text-[10px] uppercase tracking-wider text-text-ondark/60 font-mono">
                            {col.productCount} {col.productCount === 1 ? 'Piece' : 'Pieces'}
                          </span>
                        </div>

                        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-text-ondark tracking-tight">
                          {col.name}
                        </h2>

                        <p className="text-xs sm:text-sm text-text-ondark/75 font-light leading-relaxed max-w-lg">
                          {col.description ||
                            'Deliberate textures and architectural silhouettes designed to transcend seasons.'}
                        </p>

                        <div className="pt-2 text-xs font-mono text-accent-brass/90">
                          Starting from {formattedMinPrice}
                        </div>
                      </div>

                      <div className="pt-4 flex items-center gap-4">
                        <Link
                          href={`/shop?category=${col.slug}`}
                          className="inline-flex items-center gap-2.5 bg-accent-brass px-7 py-3 text-xs uppercase tracking-[0.25em] font-medium text-bg-primary hover:bg-accent-brass-hover transition-colors rounded-md shadow-md"
                        >
                          <span>Explore {col.name}</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Collection Pieces Grid */}
                {col.featuredProducts.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium">
                        Pieces in this collection
                      </span>
                      <Link
                        href={`/shop?category=${col.slug}`}
                        className="text-xs text-text-ondark/60 hover:text-accent-brass flex items-center gap-1 transition-colors"
                      >
                        <span>View All {col.name}</span>
                        <ArrowUpRight size={13} />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
                      {col.featuredProducts.slice(0, 4).map((product) => (
                        <div key={product.id} className="w-full">
                          <ProductCard
                            id={product.id}
                            name={product.name}
                            slug={product.slug}
                            categoryName={product.categoryName}
                            price={product.minPrice}
                            imageUrl={product.imageUrl}
                            aspectRatio="portrait"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 border border-hairline bg-bg-deep text-center text-xs text-text-ondark/50 rounded-md font-light">
                    New pieces currently being loomed for {col.name}. Check back shortly.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
