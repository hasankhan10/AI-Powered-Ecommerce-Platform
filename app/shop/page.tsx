import { Suspense } from 'react';
import { getFilteredProducts, getCatalogFilterOptions } from '@/lib/db/catalog';
import { CatalogClient } from '@/components/shop/CatalogClient';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { brandConfig } from '@/config/brand.config';

export const revalidate = 60;

export const metadata = {
  title: `Shop the Collection — ${brandConfig.name}`,
  description: 'Explore the complete Maison Vale collection of apparel, accessories, and home objects.',
};

export default async function ShopPage() {
  const [products, filterOptions] = await Promise.all([
    getFilteredProducts({}),
    getCatalogFilterOptions(),
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary text-text-ondark">
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="py-24 text-center text-xs tracking-widest uppercase text-accent-brass">
              Loading collection...
            </div>
          }
        >
          <CatalogClient
            initialProducts={products}
            filterOptions={filterOptions}
            currentCategorySlug="all"
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

