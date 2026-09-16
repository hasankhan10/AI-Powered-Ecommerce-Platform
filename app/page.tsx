import { getNewArrivalProducts, getHomepageCategories } from '@/lib/db/homepage';
import { HomeClient } from '@/components/home/HomeClient';

export const revalidate = 60; // Revalidate homepage data every 60s

export default async function Home() {
  const [products, categories] = await Promise.all([
    getNewArrivalProducts(6),
    getHomepageCategories(),
  ]);

  return <HomeClient products={products} categories={categories} />;
}


