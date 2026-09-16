import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CheckoutSkeleton } from '@/components/ui/Skeleton';

export default function CheckoutLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-primary text-text-ondark">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-12 py-12">
        <div className="border-b border-hairline pb-6 mb-8">
          <div className="h-3 w-28 bg-accent-brass/25 rounded animate-pulse mb-2" />
          <div className="h-8 w-56 bg-text-ondark/15 rounded animate-pulse" />
        </div>
        <CheckoutSkeleton />
      </main>
      <Footer />
    </div>
  );
}
