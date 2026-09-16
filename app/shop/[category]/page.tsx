import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getFilteredProducts, getCatalogFilterOptions } from '@/lib/db/catalog';
import { CatalogClient } from '@/components/shop/CatalogClient';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { brandConfig } from '@/config/brand.config';

export const revalidate = 60;

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category } = await params;
  const filterOptions = await getCatalogFilterOptions();
  const matched = filterOptions.categories.find((c) => c.slug === category);

  const title = matched ? `${matched.name} — ${brandConfig.name}` : `Shop — ${brandConfig.name}`;
  return {
    title,
    description: `Discover ${matched?.name || 'products'} by ${brandConfig.name}. Handcrafted with natural materials.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const [products, filterOptions] = await Promise.all([
    getFilteredProducts({ categorySlug: category }),
    getCatalogFilterOptions(),
  ]);

  const matchedCat = filterOptions.categories.find((c) => c.slug === category);

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
            currentCategorySlug={category}
            categoryTitle={matchedCat ? matchedCat.name : undefined}
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

