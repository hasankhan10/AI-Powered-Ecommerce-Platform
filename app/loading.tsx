import React from 'react';
import { LuxuryLoader } from '@/components/ui/LuxuryLoader';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-primary text-text-ondark">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-24">
        <LuxuryLoader label="Accessing Maison Vale..." sublabel="Haute Couture & Heritage" />
      </main>
      <Footer />
    </div>
  );
}
