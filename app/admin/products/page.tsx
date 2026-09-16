import React from 'react';
import { db } from '@/lib/prisma';
import { brandConfig } from '@/config/brand.config';
import { ProductListTable } from '@/components/admin/products/ProductListTable';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: `Products — ${brandConfig.name} Admin`,
};

export default async function AdminProductsPage() {
  const [products, categories, images, variants] = await Promise.all([
    db.orm.public.Product.where({}).all(),
    db.orm.public.Category.where({}).all(),
    db.orm.public.ProductImage.where({}).all(),
    db.orm.public.ProductVariant.where({}).all(),
  ]);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const formattedProducts = products.map((prod) => {
    const cat = categoryMap.get(prod.categoryId);
    const prodImages = images
      .filter((img) => img.productId === prod.id)
      .sort((a, b) => a.position - b.position);
    const prodVariants = variants.filter((v) => v.productId === prod.id);

    return {
      id: prod.id,
      name: prod.name,
      slug: prod.slug,
      description: prod.description,
      basePrice: parseFloat(prod.basePrice.toString()),
      status: prod.status,
      category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
      images: prodImages,
      variants: prodVariants.map((v) => ({
        id: v.id,
        sku: v.sku,
        size: v.size,
        color: v.color,
        price: parseFloat(v.price.toString()),
        stock: v.stock,
      })),
    };
  });

  const formattedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="border-b border-hairline pb-6">
        <span className="text-[10px] uppercase tracking-[0.3em] text-accent-brass font-medium">
          Catalogue Operations
        </span>
        <h1 className="font-serif text-3xl font-light text-text-ondark tracking-tight mt-1">
          Products Management ({products.length})
        </h1>
      </div>

      <ProductListTable
        initialProducts={formattedProducts}
        categories={formattedCategories}
      />
    </div>
  );
}

