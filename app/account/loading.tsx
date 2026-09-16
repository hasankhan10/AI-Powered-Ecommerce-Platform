import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AccountSkeleton } from '@/components/ui/Skeleton';

export default function AccountLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-primary text-text-ondark">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-12 py-12">
        <AccountSkeleton />
      </main>
      <Footer />
    </div>
  );
}
