import { db } from '@/lib/prisma';
import { FormattedProduct } from './homepage';
import { parseProductMetadata } from '@/lib/utils/productMetadata';

export interface ProductVariantItem {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  price: number;
  stock: number;
}

export interface ProductImageItem {
  id: string;
  url: string;
  altText: string | null;
  position: number;
}

export interface DetailedProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  basePrice: number;
  marketPrice?: number | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: ProductImageItem[];
  variants: ProductVariantItem[];
  relatedProducts: FormattedProduct[];
}

export interface FilterOptions {
  categories: { name: string; slug: string; count: number }[];
  sizes: string[];
  colors: string[];
  minPrice: number;
  maxPrice: number;
}

export interface CatalogFilterParams {
  categorySlug?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc';
}

export async function getCatalogFilterOptions(): Promise<FilterOptions> {
  try {
    const [categories, products, variants] = await Promise.all([
      db.orm.public.Category.where({}).all(),
      db.orm.public.Product.where({ status: 'ACTIVE' }).all(),
      db.orm.public.ProductVariant.where({}).all(),
    ]);

    // Calculate category counts
    const catCounts = new Map<string, number>();
    products.forEach((p) => {
      catCounts.set(p.categoryId, (catCounts.get(p.categoryId) || 0) + 1);
    });

    const formattedCategories = categories.map((c) => ({
      name: c.name,
      slug: c.slug,
      count: catCounts.get(c.id) || 0,
    }));

    // Extract unique sizes and colors
    const sizeSet = new Set<string>();
    const colorSet = new Set<string>();
    let minPrice = Infinity;
    let maxPrice = 0;

    variants.forEach((v) => {
      if (v.size) sizeSet.add(v.size);
      if (v.color) colorSet.add(v.color);
      const priceNum = parseFloat(v.price.toString());
      if (priceNum < minPrice) minPrice = priceNum;
      if (priceNum > maxPrice) maxPrice = priceNum;
    });

    if (minPrice === Infinity) minPrice = 0;

    return {
      categories: formattedCategories,
      sizes: Array.from(sizeSet).sort(),
      colors: Array.from(colorSet).sort(),
      minPrice: Math.floor(minPrice),
      maxPrice: Math.ceil(maxPrice),
    };
  } catch (error) {
    console.error('Error getting catalog filter options:', error);
    return {
      categories: [],
      sizes: [],
      colors: [],
      minPrice: 0,
      maxPrice: 20000,
    };
  }
}

export async function getFilteredProducts(
  params: CatalogFilterParams = {}
): Promise<FormattedProduct[]> {
  try {
    const [categories, allProducts, images, variants] = await Promise.all([
      db.orm.public.Category.where({}).all(),
      db.orm.public.Product.where({ status: 'ACTIVE' }).all(),
      db.orm.public.ProductImage.where({}).all(),
      db.orm.public.ProductVariant.where({}).all(),
    ]);

    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const categorySlugMap = new Map(categories.map((c) => [c.slug, c.id]));

    // Group images and variants by productId
    const imageMap = new Map<string, typeof images>();
    images.forEach((img) => {
      if (!imageMap.has(img.productId)) imageMap.set(img.productId, []);
      imageMap.get(img.productId)!.push(img);
    });

    const variantMap = new Map<string, typeof variants>();
    variants.forEach((v) => {
      if (!variantMap.has(v.productId)) variantMap.set(v.productId, []);
      variantMap.get(v.productId)!.push(v);
    });

    let filtered = allProducts;

    // Filter by category
    if (params.categorySlug && params.categorySlug !== 'all') {
      const catId = categorySlugMap.get(params.categorySlug);
      if (catId) {
        filtered = filtered.filter((p) => p.categoryId === catId);
      }
    }

    // Format products with minPrice, images, variants
    let formatted: FormattedProduct[] = filtered.map((prod) => {
      const cat = categoryMap.get(prod.categoryId);
      const prodImages = (imageMap.get(prod.id) || []).sort(
        (a, b) => a.position - b.position
      );
      const prodVariants = variantMap.get(prod.id) || [];
      const meta = parseProductMetadata(prod.description);

      const minVarPrice =
        prodVariants.length > 0
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

    // Filter by size
    if (params.size) {
      formatted = formatted.filter((p) => {
        const prodVariants = variantMap.get(p.id) || [];
        return prodVariants.some(
          (v) => v.size?.toLowerCase() === params.size?.toLowerCase()
        );
      });
    }

    // Filter by color
    if (params.color) {
      formatted = formatted.filter((p) => {
        const prodVariants = variantMap.get(p.id) || [];
        return prodVariants.some(
          (v) => v.color?.toLowerCase() === params.color?.toLowerCase()
        );
      });
    }

    // Filter by price range
    if (params.minPrice !== undefined) {
      formatted = formatted.filter((p) => p.minPrice >= params.minPrice!);
    }
    if (params.maxPrice !== undefined) {
      formatted = formatted.filter((p) => p.minPrice <= params.maxPrice!);
    }

    // Sort
    if (params.sort === 'price_asc') {
      formatted.sort((a, b) => a.minPrice - b.minPrice);
    } else if (params.sort === 'price_desc') {
      formatted.sort((a, b) => b.minPrice - a.minPrice);
    }

    return formatted;
  } catch (error) {
    console.error('Error fetching filtered products:', error);
    return [];
  }
}

export async function getProductDetail(slug: string): Promise<DetailedProduct | null> {
  try {
    const products = await db.orm.public.Product.where({ slug }).all();
    const product = products[0];
    if (!product) return null;

    const [categories, images, variants, allActiveProducts] = await Promise.all([
      db.orm.public.Category.where({ id: product.categoryId }).all(),
      db.orm.public.ProductImage.where({ productId: product.id }).all(),
      db.orm.public.ProductVariant.where({ productId: product.id }).all(),
      db.orm.public.Product.where({ status: 'ACTIVE', categoryId: product.categoryId }).all(),
    ]);

    const category = categories[0] || {
      id: product.categoryId,
      name: 'Collection',
      slug: 'collection',
    };

    const formattedImages: ProductImageItem[] = images
      .sort((a, b) => a.position - b.position)
      .map((img) => ({
        id: img.id,
        url: img.url,
        altText: img.altText,
        position: img.position,
      }));

    const formattedVariants: ProductVariantItem[] = variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      price: parseFloat(v.price.toString()),
      stock: v.stock,
    }));

    // Related products in the same category (excluding current)
    const relatedList = allActiveProducts.filter((p) => p.id !== product.id).slice(0, 4);
    const relatedImages = await db.orm.public.ProductImage.where({}).all();
    const relatedVariants = await db.orm.public.ProductVariant.where({}).all();

    const relatedFormatted: FormattedProduct[] = relatedList.map((rel) => {
      const relImgs = relatedImages
        .filter((img) => img.productId === rel.id)
        .sort((a, b) => a.position - b.position);
      const relVars = relatedVariants.filter((v) => v.productId === rel.id);
      const relMeta = parseProductMetadata(rel.description);
      const minPrice =
        relVars.length > 0
          ? Math.min(...relVars.map((v) => parseFloat(v.price.toString())))
          : parseFloat(rel.basePrice.toString());

      return {
        id: rel.id,
        name: rel.name,
        slug: rel.slug,
        description: rel.description,
        basePrice: parseFloat(rel.basePrice.toString()),
        marketPrice: relMeta.marketPrice,
        categoryName: category.name,
        categorySlug: category.slug,
        imageUrl:
          relImgs[0]?.url ||
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80',
        minPrice,
      };
    });

    const productMeta = parseProductMetadata(product.description);

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      basePrice: parseFloat(product.basePrice.toString()),
      marketPrice: productMeta.marketPrice,
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
      images: formattedImages,
      variants: formattedVariants,
      relatedProducts: relatedFormatted,
    };
  } catch (error) {
    console.error('Error fetching product detail:', error);
    return null;
  }
}

export interface CollectionWithProducts {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  position: number;
  productCount: number;
  minPrice: number;
  featuredProducts: FormattedProduct[];
}

export async function getCollectionsWithProducts(): Promise<CollectionWithProducts[]> {
  try {
    const [categories, allProducts, images, variants] = await Promise.all([
      db.orm.public.Category.where({}).all(),
      db.orm.public.Product.where({ status: 'ACTIVE' }).all(),
      db.orm.public.ProductImage.where({}).all(),
      db.orm.public.ProductVariant.where({}).all(),
    ]);

    // Map images and variants by productId
    const imageMap = new Map<string, typeof images>();
    images.forEach((img) => {
      if (!imageMap.has(img.productId)) imageMap.set(img.productId, []);
      imageMap.get(img.productId)!.push(img);
    });

    const variantMap = new Map<string, typeof variants>();
    variants.forEach((v) => {
      if (!variantMap.has(v.productId)) variantMap.set(v.productId, []);
      variantMap.get(v.productId)!.push(v);
    });

    const collections: CollectionWithProducts[] = categories
      .sort((a, b) => a.position - b.position)
      .map((cat) => {
        const catProducts = allProducts.filter((p) => p.categoryId === cat.id);

        let catMinPrice = Infinity;

        const formattedProducts: FormattedProduct[] = catProducts.map((prod) => {
          const prodImages = (imageMap.get(prod.id) || []).sort(
            (a, b) => a.position - b.position
          );
          const prodVariants = variantMap.get(prod.id) || [];

          const minVarPrice =
            prodVariants.length > 0
              ? Math.min(...prodVariants.map((v) => parseFloat(v.price.toString())))
              : parseFloat(prod.basePrice.toString());

          if (minVarPrice < catMinPrice) catMinPrice = minVarPrice;

          return {
            id: prod.id,
            name: prod.name,
            slug: prod.slug,
            description: prod.description,
            basePrice: parseFloat(prod.basePrice.toString()),
            categoryName: cat.name,
            categorySlug: cat.slug,
            imageUrl:
              prodImages[0]?.url ||
              'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80',
            minPrice: minVarPrice,
          };
        });

        if (catMinPrice === Infinity) catMinPrice = 0;

        return {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          imageUrl:
            cat.imageUrl ||
            formattedProducts[0]?.imageUrl ||
            'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&q=80',
          position: cat.position,
          productCount: formattedProducts.length,
          minPrice: catMinPrice,
          featuredProducts: formattedProducts,
        };
      });

    return collections;
  } catch (error) {
    console.error('Error fetching collections with products:', error);
    return [];
  }
}
