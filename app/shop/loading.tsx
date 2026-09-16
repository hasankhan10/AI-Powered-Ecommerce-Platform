import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';

export default function ShopLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-primary text-text-ondark">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-12 py-12">
        {/* Header Skeleton */}
        <div className="border-b border-hairline pb-8 mb-10 space-y-3">
          <div className="h-3 w-28 bg-accent-brass/20 rounded animate-pulse" />
          <div className="h-9 w-64 bg-text-ondark/10 rounded animate-pulse" />
          <div className="h-4 w-96 max-w-full bg-text-ondark/5 rounded animate-pulse" />
        </div>

        {/* Filters Bar Skeleton */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline/60 pb-6 mb-8">
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-8 w-20 sm:w-24 bg-bg-deep border border-hairline rounded-full animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
          <div className="h-8 w-32 bg-bg-deep border border-hairline rounded-md animate-pulse" />
        </div>

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
