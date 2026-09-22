'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { ProductCard } from '@/components/product/ProductCard';
import { FormattedProduct } from '@/lib/db/homepage';
import { content } from '@/config/content';
import { FadeInView, StaggerContainer, staggerItemVariants } from '@/components/ui/FadeInView';

interface NewArrivalsProps {
  products: FormattedProduct[];
}

export function NewArrivals({ products }: NewArrivalsProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="w-full bg-bg-primary py-24 border-b border-hairline overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Section Header with FadeInView */}
        <FadeInView direction="up" distance={24} duration={0.8}>
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
        </FadeInView>

        {/* Staggered Animated Product Grid */}
        <StaggerContainer
          staggerDelay={0.1}
          className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 lg:gap-10"
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={staggerItemVariants}
              className="w-full"
            >
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
            </motion.div>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
