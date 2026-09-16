import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductDetailSkeleton } from '@/components/ui/Skeleton';

export default function ProductDetailLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-primary text-text-ondark">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-12 py-12">
        <ProductDetailSkeleton />
      </main>
      <Footer />
    </div>
  );
}
