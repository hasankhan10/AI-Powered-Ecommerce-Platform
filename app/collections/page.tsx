import { Suspense } from 'react';
import { getCollectionsWithProducts } from '@/lib/db/catalog';
import { CollectionsClient } from '@/components/collections/CollectionsClient';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { brandConfig } from '@/config/brand.config';

export const revalidate = 60;

export const metadata = {
  title: `Curated Collections — ${brandConfig.name}`,
  description:
    'Explore curated collections of apparel, accessories, and home objects crafted with quiet precision.',
};

export default async function CollectionsPage() {
  const collections = await getCollectionsWithProducts();

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary text-text-ondark">
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="py-24 text-center text-xs tracking-widest uppercase text-accent-brass">
              Loading collections...
            </div>
          }
        >
          <CollectionsClient collections={collections} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
