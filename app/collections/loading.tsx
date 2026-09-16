import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';

export default function CollectionsLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-primary text-text-ondark">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-12 py-12">
        <div className="border-b border-hairline pb-8 mb-10 space-y-3 text-center">
          <div className="h-3 w-32 bg-accent-brass/20 rounded mx-auto animate-pulse" />
          <div className="h-10 w-72 bg-text-ondark/15 rounded mx-auto animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
