import { db } from '@/lib/prisma';
import { parseProductMetadata } from '@/lib/utils/productMetadata';

export interface FormattedProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  basePrice: number;
  marketPrice?: number | null;
  categoryName: string;
  categorySlug: string;
  imageUrl: string;
  minPrice: number;
}

export interface FormattedCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  position: number;
}

export async function getHomepageCategories(): Promise<FormattedCategory[]> {
  try {
    const categories = await db.orm.public.Category.where({}).all();
    return categories
      .sort((a, b) => a.position - b.position)
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        imageUrl: cat.imageUrl,
        position: cat.position,
      }));
  } catch (error) {
    console.error('Error fetching homepage categories:', error);
    return [];
  }
}

export async function getNewArrivalProducts(limit = 6): Promise<FormattedProduct[]> {
  try {
    // Fetch active products
    const products = await db.orm.public.Product.where({ status: 'ACTIVE' }).all();
    const categories = await db.orm.public.Category.where({}).all();
    const images = await db.orm.public.ProductImage.where({}).all();
    const variants = await db.orm.public.ProductVariant.where({}).all();

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    const formatted: FormattedProduct[] = products.slice(0, limit).map((prod) => {
      const cat = categoryMap.get(prod.categoryId);
      const prodImages = images
        .filter((img) => img.productId === prod.id)
        .sort((a, b) => a.position - b.position);
      const prodVariants = variants.filter((v) => v.productId === prod.id);
      const meta = parseProductMetadata(prod.description);

      const minVarPrice = prodVariants.length > 0
        ? Math.min(...prodVariants.map((v) => parseFloat(v.price.toString())))
        : parseFloat(prod.basePrice.toString());

      return {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        basePrice: parseFloat(prod.basePrice.toString()),
        marketPrice: meta.marketPrice,
        categoryName: cat?.name ?? 'Collection',
        categorySlug: cat?.slug ?? 'all',
        imageUrl:
          prodImages[0]?.url ||
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80',
        minPrice: minVarPrice,
      };
    });

    return formatted;
  } catch (error) {
    console.error('Error fetching new arrival products:', error);
    return [];
  }
}

