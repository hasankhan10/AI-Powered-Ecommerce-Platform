'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ScrollHero } from '@/components/home/ScrollHero';
import { NewArrivals } from '@/components/home/NewArrivals';
import { BestSellersCarousel } from '@/components/home/BestSellersCarousel';
import { EditorialSection } from '@/components/home/EditorialSection';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { TrustBar } from '@/components/home/TrustBar';
import { Testimonials } from '@/components/home/Testimonials';
import { FormattedProduct, FormattedCategory } from '@/lib/db/homepage';

interface HomeClientProps {
  products: FormattedProduct[];
  categories: FormattedCategory[];
}

export function HomeClient({ products, categories }: HomeClientProps) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-primary text-text-ondark">
      {/* Navigation Header */}
      <Navbar />

      {/* Main Homepage Sections */}
      <main className="flex-1">
        {/* Apple-style Canvas Frame-by-Frame Scroll Hero */}
        <ScrollHero />

        {/* New Arrivals Grid */}
        <NewArrivals products={products} />

        {/* Cinematic Best Sellers Interactive Carousel */}
        <BestSellersCarousel products={products} />

        {/* Brand Editorial & Heritage */}
        <EditorialSection />

        {/* Categories Showcase (Shop by Category) */}
        <CategoryGrid categories={categories} />

        {/* Brand Trust Bar (Heritage, Delivered Count, Boutiques, Satisfaction) */}
        <TrustBar />

        {/* Patron Testimonials / Reviews */}
        <Testimonials />
      </main>

      {/* Storefront Footer */}
      <Footer />
    </div>
  );
}
