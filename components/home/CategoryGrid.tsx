'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { FormattedCategory } from '@/lib/db/homepage';
import { content } from '@/config/content';

interface CategoryGridProps {
  categories: FormattedCategory[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="w-full bg-bg-primary py-24 border-b border-hairline">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Header */}
        <div className="space-y-2 mb-16">
          <span className="text-[11px] uppercase tracking-[0.3em] text-accent-brass font-medium">
            {content.home.categories.eyebrow}
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-light text-text-ondark tracking-tight">
            {content.home.categories.headline}
          </h2>
        </div>

        {/* Categories Grid - 2 columns on mobile, 3 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-6 lg:gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group relative block aspect-[4/5] sm:aspect-[3/4] rounded-md border border-hairline bg-bg-deep overflow-hidden transition-all duration-300 hover:border-accent-brass/40 shadow-sm hover:shadow-xl"
            >
              {/* Category Background Image */}
              {cat.imageUrl ? (
                <Image
                  src={cat.imageUrl}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover object-center brightness-75 transition-transform duration-700 group-hover:scale-105 group-hover:brightness-90"
                />
              ) : (
                <div className="h-full w-full bg-bg-deep" />
              )}

              {/* Gradient Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/20 to-transparent" />

              {/* Content Card Overlay */}
              <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-8 flex items-end justify-between border-t border-hairline/30 backdrop-blur-sm bg-bg-primary/40">
                <div className="space-y-0.5 sm:space-y-1 min-w-0 pr-2">
                  <h3 className="font-serif text-sm sm:text-2xl font-light text-text-ondark group-hover:text-accent-brass transition-colors truncate sm:whitespace-normal">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="hidden sm:block text-xs text-text-ondark/70 font-light line-clamp-2">
                      {cat.description}
                    </p>
                  )}
                </div>

                <div className="flex h-7 w-7 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-hairline bg-bg-primary text-text-ondark group-hover:border-accent-brass group-hover:text-accent-brass transition-all shrink-0">
                  <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
