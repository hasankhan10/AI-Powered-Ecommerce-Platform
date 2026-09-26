'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Check,
  ArrowUpRight,
  Eye,
  ShieldCheck,
  Package,
  Clock,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FormattedProduct } from '@/lib/db/homepage';
import { brandConfig } from '@/config/brand.config';
import { content } from '@/config/content';
import { FadeInView, StaggerContainer, staggerItemVariants } from '@/components/ui/FadeInView';
import { useCartStore } from '@/lib/store/useCartStore';

interface NewArrivalsProps {
  products: FormattedProduct[];
}

export function NewArrivals({ products }: NewArrivalsProps) {
  const { addItem } = useCartStore();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  // Extract unique categories for filter tabs
  const categories = useMemo(() => {
    if (!products) return ['all'];
    const unique = Array.from(new Set(products.map((p) => p.categoryName).filter(Boolean)));
    return ['all', ...unique];
  }, [products]);

  // Filter products based on active category
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (activeCategory === 'all') return products;
    return products.filter((p) => p.categoryName === activeCategory);
  }, [products, activeCategory]);

  if (!products || products.length === 0) return null;

  const handleQuickAdd = (e: React.MouseEvent, product: FormattedProduct) => {
    e.preventDefault();
    e.stopPropagation();

    setAddingId(product.id);
    addItem(product.id, undefined, 1, {
      productName: product.name,
      productSlug: product.slug,
      price: product.minPrice,
      imageUrl: product.imageUrl,
    });

    setTimeout(() => {
      setAddingId(null);
      setAddedId(product.id);
      setTimeout(() => setAddedId(null), 2200);
    }, 400);
  };

  return (
    <section className="w-full bg-gradient-to-b from-bg-primary via-[#0c0a09] to-bg-primary py-28 border-b border-hairline overflow-hidden relative">
      {/* Subtle Ambient Radial Lighting in Background */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-radial from-accent-brass/10 via-transparent to-transparent blur-3xl opacity-60" />

      <div className="mx-auto max-w-7xl px-6 lg:px-12 relative z-10 space-y-16">
        {/* Editorial Section Header */}
        <FadeInView direction="up" distance={28} duration={0.85}>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-hairline/60 pb-10">
            <div className="space-y-4 max-w-2xl">
              {/* Luxury Atelier Eyebrow */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full border border-accent-brass/30 bg-accent-brass/10 text-accent-brass text-[10px] uppercase tracking-[0.28em] font-medium shadow-sm">
                <Sparkles size={12} className="animate-pulse" />
                <span>Atelier Release // Edition 2026</span>
              </div>

              {/* Grand Display Headline */}
              <h2 className="font-serif text-4xl sm:text-6xl font-light text-text-ondark tracking-tight leading-[1.05]">
                {content.home.newArrivals.headline}
              </h2>

              <p className="text-xs sm:text-sm text-text-ondark/70 font-light leading-relaxed tracking-wide">
                Freshly finished silhouettes sculpted with quiet intention, rare natural fibres, and meticulous atelier finishing.
              </p>
            </div>

            {/* Right Controls: Filter Chips & View All Link */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6 self-start lg:self-end">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-bg-deep/80 border border-hairline backdrop-blur-md">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`relative px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] transition-all duration-300 rounded-md cursor-pointer ${
                        isActive
                          ? 'text-bg-primary font-medium'
                          : 'text-text-ondark/60 hover:text-text-ondark'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="activeCategoryPill"
                          className="absolute inset-0 bg-accent-brass rounded-md shadow-sm"
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 capitalize">
                        {cat === 'all' ? 'All Pieces' : cat}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* View All Discovery Link */}
              <Link
                href="/shop"
                className="group flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-text-ondark/80 hover:text-accent-brass transition-all duration-300 border-b border-transparent hover:border-accent-brass pb-0.5"
              >
                <span>{content.home.newArrivals.cta}</span>
                <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1.5 text-accent-brass" />
              </Link>
            </div>
          </div>
        </FadeInView>

        {/* Haute-Couture Products Grid with Staggered Entrance */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10"
          >
            {filteredProducts.map((product, index) => {
              const formattedPrice = new Intl.NumberFormat(brandConfig.currency.locale, {
                style: 'currency',
                currency: brandConfig.currency.code,
                maximumFractionDigits: 0,
              }).format(product.minPrice);

              const hasDiscount = !!product.marketPrice && product.marketPrice > product.minPrice;
              const discountPercent = hasDiscount && product.marketPrice
                ? Math.round(((product.marketPrice - product.minPrice) / product.marketPrice) * 100)
                : null;

              const isItemAdding = addingId === product.id;
              const isItemAdded = addedId === product.id;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.7,
                    delay: index * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="group relative flex flex-col"
                >
                  <Link href={`/product/${product.slug}`} className="block relative w-full overflow-hidden rounded-lg bg-bg-deep border border-hairline/80 transition-all duration-500 hover:border-accent-brass/60 hover:shadow-2xl hover:shadow-accent-brass/10">
                    {/* Portrait Image Stage with Smooth Kinetic Scale */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-bg-deep">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106 brightness-95 group-hover:brightness-100"
                      />

                      {/* Ambient Gradient Reflex */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#070605] via-[#070605]/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none" />

                      {/* Top Badges: Category Pill & Index Number */}
                      <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none z-10">
                        <span className="px-3 py-1 rounded-full bg-bg-primary/80 backdrop-blur-md border border-hairline text-[9px] uppercase tracking-[0.22em] text-accent-brass font-medium shadow-sm">
                          {product.categoryName || 'Atelier Exclusive'}
                        </span>

                        {hasDiscount && discountPercent && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-[9px] uppercase tracking-wider text-emerald-300 font-semibold shadow-sm">
                            {discountPercent}% Off
                          </span>
                        )}
                      </div>

                      {/* Quick View Corner Glance Trigger */}
                      <div className="absolute bottom-4 right-4 hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-bg-primary/80 border border-hairline/80 backdrop-blur-md text-text-ondark opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-md">
                        <ArrowUpRight size={15} className="text-accent-brass group-hover:rotate-45 transition-transform duration-300" />
                      </div>

                      {/* Floating Liquid Glass "Quick Add" Pill on Hover */}
                      <div className="absolute inset-x-4 bottom-4 flex justify-center opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20">
                        <button
                          type="button"
                          onClick={(e) => handleQuickAdd(e, product)}
                          disabled={isItemAdding}
                          className={`w-full py-3 px-4 rounded-md text-[10px] uppercase tracking-[0.22em] font-medium flex items-center justify-center gap-2 shadow-2xl backdrop-blur-md transition-all duration-300 cursor-pointer ${
                            isItemAdded
                              ? 'bg-emerald-600 text-white border border-emerald-400'
                              : 'bg-accent-brass text-bg-primary hover:bg-accent-brass-hover border border-accent-brass/80'
                          }`}
                        >
                          {isItemAdded ? (
                            <>
                              <Check size={14} className="text-white" />
                              <span>Added to Bag</span>
                            </>
                          ) : isItemAdding ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              <span>Acquiring...</span>
                            </>
                          ) : (
                            <>
                              <ShoppingBag size={14} />
                              <span>Acquire Piece</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Metadata Card Footer */}
                    <div className="p-5 bg-gradient-to-b from-bg-deep to-[#0e0c0a] space-y-2 border-t border-hairline/50">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 min-w-0">
                          <h3 className="font-serif text-lg font-light text-text-ondark group-hover:text-accent-brass transition-colors duration-300 truncate">
                            {product.name}
                          </h3>
                          <p className="text-[11px] text-text-ondark/50 font-light tracking-wide">
                            Bespoke Cut • Hand-Finished
                          </p>
                        </div>

                        {/* Price Display */}
                        <div className="text-right shrink-0">
                          <span className="font-serif text-base font-normal text-text-ondark tracking-wide block">
                            {formattedPrice}
                          </span>
                          {hasDiscount && product.marketPrice && (
                            <span className="text-[10px] text-text-ondark/40 line-through font-light block">
                              ₹{product.marketPrice.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Luxury Service Ribbon */}
        <FadeInView direction="up" distance={20} duration={0.8} delay={0.2}>
          <div className="border border-hairline/80 bg-bg-deep/60 rounded-lg p-6 sm:p-8 backdrop-blur-md">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-hairline/60">
              <div className="flex items-center gap-4 sm:justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-brass/10 border border-accent-brass/20 text-accent-brass shrink-0">
                  <Package size={16} />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-light text-text-ondark">Bespoke Packaging</h4>
                  <p className="text-[10px] text-text-ondark/50 font-light">Signature gift boxes & garment cases</p>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:justify-center pt-4 sm:pt-0 sm:pl-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-brass/10 border border-accent-brass/20 text-accent-brass shrink-0">
                  <Clock size={16} />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-light text-text-ondark">Express Dispatch</h4>
                  <p className="text-[10px] text-text-ondark/50 font-light">Dispatched within 24–48 hours</p>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:justify-center pt-4 sm:pt-0 sm:pl-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-brass/10 border border-accent-brass/20 text-accent-brass shrink-0">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-light text-text-ondark">Atelier Guarantee</h4>
                  <p className="text-[10px] text-text-ondark/50 font-light">Lifetime craftsmanship integrity</p>
                </div>
              </div>
            </div>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}
