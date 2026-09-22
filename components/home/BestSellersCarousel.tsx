'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import { FormattedProduct } from '@/lib/db/homepage';
import { content } from '@/config/content';
import { brandConfig } from '@/config/brand.config';

import { FadeInView } from '@/components/ui/FadeInView';

interface BestSellersCarouselProps {
  products: FormattedProduct[];
}

// Curated luxury best-seller fallback items if products array has fewer than 5 items
const LUXURY_BEST_SELLERS = [
  {
    id: 'bs-1',
    name: 'Elite Oud Imperial',
    slug: 'elite-oud-imperial',
    categoryName: 'Haute Parfumerie',
    price: 18500,
    imageUrl:
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1200&q=85',
    tagline: 'Smoky Birch, Cambodian Agarwood, Rare Rose',
  },
  {
    id: 'bs-2',
    name: 'Velvet Tobacco & Amber',
    slug: 'velvet-tobacco-amber',
    categoryName: 'Extrait de Parfum',
    price: 14200,
    imageUrl:
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=1200&q=85',
    tagline: 'Bourbon Vanilla, Cured Tobacco Leaf, Honey',
  },
  {
    id: 'bs-3',
    name: 'Santale Mystique',
    slug: 'santale-mystique',
    categoryName: 'Artisanal Elixir',
    price: 16800,
    imageUrl:
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=1200&q=85',
    tagline: 'Mysore Sandalwood, Cardamom, Violet Leaf',
  },
  {
    id: 'bs-4',
    name: 'Nocturne Vetiver',
    slug: 'nocturne-vetiver',
    categoryName: 'Parfum Intense',
    price: 15400,
    imageUrl:
      'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=1200&q=85',
    tagline: 'Haitian Vetiver, Roasted Tonka, Bergamot',
  },
  {
    id: 'bs-5',
    name: 'Cuir Royal Sovereign',
    slug: 'cuir-royal-sovereign',
    categoryName: 'Bespoke Blend',
    price: 19600,
    imageUrl:
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1200&q=85',
    tagline: 'Tuscan Leather, Saffron, Dark Iris',
  },
];

export function BestSellersCarousel({ products }: BestSellersCarouselProps) {
  // Combine incoming catalog products with luxury best-seller showcase items
  const items = React.useMemo(() => {
    if (products && products.length >= 4) {
      return products.map((p, idx) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        categoryName: p.categoryName || 'Maison Selection',
        price: p.minPrice || p.basePrice || 12000,
        imageUrl: p.imageUrl,
        tagline: LUXURY_BEST_SELLERS[idx % LUXURY_BEST_SELLERS.length].tagline,
      }));
    }
    return LUXURY_BEST_SELLERS;
  }, [products]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const total = items.length;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Navigation handlers with infinite wrap-around
  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [total]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  }, [total]);

  const handleSelect = (index: number) => {
    setActiveIndex(index);
  };

  // Autoplay functionality (auto scroll every 3s, pauses on hover or interaction)
  useEffect(() => {
    if (isPaused || isDragging) return;
    const interval = setInterval(() => {
      handleNext();
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused, isDragging, handleNext]);

  // Touch & Drag Gesture Handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const delta = clientX - startX;
    setDragOffset(delta);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset > 60) {
      handlePrev();
    } else if (dragOffset < -60) {
      handleNext();
    }
    setDragOffset(0);
  };

  // Active product details
  const activeProduct = items[activeIndex];
  const formattedPrice = new Intl.NumberFormat(brandConfig.currency.locale, {
    style: 'currency',
    currency: brandConfig.currency.code,
    maximumFractionDigits: 0,
  }).format(activeProduct.price);

  const cardStep = isMobile ? 320 : 440;

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-gradient-to-b from-[#0a0908] via-[#240a10] to-[#0a0908] py-24 md:py-32 border-y border-hairline"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        setIsPaused(false);
        if (isDragging) handleTouchEnd();
      }}
    >
      {/* Cinematic Ambient Radial Glow Behind Center Card */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[650px] bg-radial from-accent-wine/60 via-accent-wine/15 to-transparent blur-3xl opacity-75" />

      <div className="mx-auto max-w-7xl px-6 lg:px-12 relative z-10">
        {/* Header with FadeInView */}
        <FadeInView direction="up" distance={24} duration={0.8}>
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-14 md:mb-20">
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-[0.3em] text-accent-brass font-medium">
                {content.home.bestSellers?.eyebrow || 'Signature Formulations'}
              </span>
              <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-light text-text-ondark tracking-tight">
                {content.home.bestSellers?.headline || 'Best Sellers'}
              </h2>
            </div>

            <p className="text-xs md:text-sm text-text-ondark/60 font-light max-w-md mt-3 md:mt-0 leading-relaxed">
              {content.home.bestSellers?.subheadline ||
                'The most coveted artisanal creations, defined by rare notes and deliberate craftsmanship.'}
            </p>
          </div>
        </FadeInView>

        {/* 3D Interactive Large Carousel Stage */}
        <div
          className="relative w-full h-[520px] sm:h-[620px] md:h-[680px] flex items-center justify-center cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseMove={handleTouchMove}
          onMouseUp={handleTouchEnd}
        >
          {items.map((item, idx) => {
            // Compute shortest circular offset from active item
            let offset = idx - activeIndex;
            if (offset < -Math.floor(total / 2)) offset += total;
            if (offset > Math.floor(total / 2)) offset -= total;

            const isCurrent = offset === 0;
            const isLeft1 = offset === -1;
            const isRight1 = offset === 1;

            // Only render cards within distance 2 of center for performance & aesthetics
            const isVisible = Math.abs(offset) <= 2;
            if (!isVisible) return null;

            // Large Positioning calculations matching NewArrivals scale
            const translateX = offset * cardStep + (isDragging ? dragOffset * 0.4 : 0);
            const scale = isCurrent ? 1 : isLeft1 || isRight1 ? 0.88 : 0.76;
            const opacity = isCurrent ? 1 : isLeft1 || isRight1 ? 0.28 : 0.08;
            const zIndex = isCurrent ? 30 : isLeft1 || isRight1 ? 20 : 10;

            return (
              <div
                key={item.id}
                onClick={() => !isCurrent && handleSelect(idx)}
                style={{
                  transform: `translateX(${translateX}px) scale(${scale})`,
                  opacity,
                  zIndex,
                  transition: isDragging
                    ? 'none'
                    : 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 700ms cubic-bezier(0.22, 1, 0.36, 1)',
                }}
                className={`absolute w-[290px] sm:w-[360px] md:w-[420px] lg:w-[450px] aspect-[3/4] rounded-md border transition-all duration-300 overflow-hidden ${
                  isCurrent
                    ? 'border-accent-brass/60 shadow-[0_30px_70px_-10px_rgba(0,0,0,0.98)] ring-1 ring-accent-brass/40'
                    : 'border-hairline/20 hover:opacity-50 hover:border-accent-brass/30'
                }`}
              >
                {/* Product Poster Image */}
                <div className="relative w-full h-full bg-bg-deep rounded-md overflow-hidden">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 360px, (max-width: 1200px) 440px, 480px"
                    className={`object-cover object-center transition-transform duration-700 ease-out ${
                      isCurrent ? 'scale-100 hover:scale-105' : 'scale-100'
                    }`}
                    priority={isCurrent}
                  />

                  {/* Dark Vignette / Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-deep/95 via-bg-deep/25 to-transparent" />

                  {/* Card Content Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 space-y-2 text-left">
                    <span className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-accent-brass font-medium">
                      {item.categoryName}
                    </span>
                    <h3 className="font-serif text-xl md:text-2xl lg:text-3xl font-light text-text-ondark line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-text-ondark/70 font-light line-clamp-1 italic">
                      {item.tagline}
                    </p>
                  </div>

                  {/* Corner Icon for Active Product */}
                  {isCurrent && (
                    <div className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-bg-primary/80 backdrop-blur-md text-accent-brass">
                      <ArrowUpRight size={16} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Controls & Prominent Buy Now CTA Bar */}
        <div className="mt-10 flex flex-col items-center justify-center space-y-6">
          {/* Active Product Headline & Price Display */}
          <div className="text-center space-y-1.5 animate-in fade-in duration-300">
            <h4 className="font-serif text-2xl md:text-3xl font-light text-text-ondark tracking-wide">
              {activeProduct.name}
            </h4>
            <span className="text-base md:text-lg font-sans tracking-widest text-accent-brass font-medium">
              {formattedPrice}
            </span>
          </div>

          {/* Navigation Bar with Minimalist Arrows and Luxury BUY NOW Button */}
          <div className="flex items-center gap-6">
            {/* Left Chevron */}
            <button
              onClick={handlePrev}
              className="flex h-11 w-11 items-center justify-center rounded-md border border-hairline bg-bg-deep/80 text-text-ondark/70 backdrop-blur-md hover:border-accent-brass hover:text-accent-brass transition-all duration-200 focus:outline-none"
              aria-label="Previous product"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Central BUY NOW CTA */}
            <Link
              href={`/product/${activeProduct.slug}`}
              className="relative group overflow-hidden rounded-md px-12 py-4 bg-[#38121a] hover:bg-accent-brass text-text-ondark hover:text-bg-primary border border-accent-brass/40 shadow-2xl transition-all duration-300"
            >
              <span className="relative z-10 text-xs md:text-sm uppercase tracking-[0.3em] font-medium transition-colors">
                {content.home.bestSellers?.cta || 'BUY NOW'}
              </span>
              {/* Subtle hover gleam */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </Link>

            {/* Right Chevron */}
            <button
              onClick={handleNext}
              className="flex h-11 w-11 items-center justify-center rounded-md border border-hairline bg-bg-deep/80 text-text-ondark/70 backdrop-blur-md hover:border-accent-brass hover:text-accent-brass transition-all duration-200 focus:outline-none"
              aria-label="Next product"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Pagination Dot Indicators */}
          <div className="flex items-center gap-2 pt-2">
            {items.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => handleSelect(dotIdx)}
                className={`h-1 transition-all duration-300 focus:outline-none ${
                  dotIdx === activeIndex
                    ? 'w-8 bg-accent-brass'
                    : 'w-2.5 bg-text-ondark/20 hover:bg-text-ondark/40'
                }`}
                aria-label={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
