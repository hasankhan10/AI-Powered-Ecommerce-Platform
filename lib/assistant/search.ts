import { db } from '@/lib/prisma';
import { RecommendedProduct } from '@/components/assistant/AssistantProductCard';

export interface AssistantSearchParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  inStockOnly?: boolean;
}

export async function searchStoreProducts(
  params: AssistantSearchParams
): Promise<RecommendedProduct[]> {
  try {
    const [products, categories, variants, images] = await Promise.all([
      db.orm.public.Product.where({}).all(),
      db.orm.public.Category.where({}).all(),
      db.orm.public.ProductVariant.where({}).all(),
      db.orm.public.ProductImage.where({}).all(),
    ]);

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
    const categorySlugMap = new Map(categories.map((c) => [c.slug.toLowerCase(), c.id]));

    // Map images by productId (sorted by position)
    const imageMap = new Map<string, string>();
    const sortedImages = [...images].sort((a, b) => (a.position || 0) - (b.position || 0));
    for (const img of sortedImages) {
      if (!imageMap.has(img.productId)) {
        imageMap.set(img.productId, img.url);
      }
    }

    // Group variants by productId
    const variantsByProduct = new Map<string, typeof variants>();
    for (const vr of variants) {
      const list = variantsByProduct.get(vr.productId) || [];
      list.push(vr);
      variantsByProduct.set(vr.productId, list);
    }

    // Filter active products
    let matching = products.filter((p) => p.status !== 'ARCHIVED');

    // Filter by category if provided
    if (params.category) {
      const catQuery = params.category.toLowerCase().trim();
      const matchedCatId =
        categorySlugMap.get(catQuery) ||
        categories.find((c) => c.name.toLowerCase().includes(catQuery))?.id;

      if (matchedCatId) {
        matching = matching.filter((p) => p.categoryId === matchedCatId);
      }
    }

    // Semantic synonyms for lifestyle occasions and aesthetics
    const OCCASION_SYNONYMS: Record<string, string[]> = {
      wedding: ['silk', 'linen', 'trouser', 'shirt', 'clutch', 'scarf', 'wrap'],
      summer: ['linen', 'cotton', 'silk', 'raffia', 'wrap', 'shirt'],
      evening: ['silk', 'clutch', 'blazer', 'trouser', 'scarf'],
      dinner: ['linen', 'silk', 'clutch', 'shirt'],
      party: ['silk', 'clutch', 'trouser', 'wrap', 'scarf'],
      festive: ['silk', 'linen', 'scarf', 'clutch'],
      formal: ['blazer', 'trouser', 'silk', 'shirt'],
      casual: ['shirt', 'trouser', 'wrap', 'linen'],
      resort: ['linen', 'wrap', 'raffia', 'cotton'],
      gift: ['scarf', 'clutch', 'candle', 'mug', 'runner', 'belt'],
      gifting: ['scarf', 'clutch', 'candle', 'mug', 'runner', 'belt'],
      home: ['candle', 'mug', 'runner', 'ceramic'],
    };

    // Filter by query keywords with semantic expansion
    if (params.query && params.query.trim()) {
      const rawTokens = params.query
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((t) => t.length > 2 && !['and', 'for', 'the', 'with', 'under', 'something', 'piece', 'pieces'].includes(t));

      const tokens = new Set<string>(rawTokens);
      for (const t of rawTokens) {
        if (OCCASION_SYNONYMS[t]) {
          OCCASION_SYNONYMS[t].forEach((syn) => tokens.add(syn));
        }
      }

      const tokenArray = Array.from(tokens);
      if (tokenArray.length > 0) {
        const filtered = matching.filter((p) => {
          const name = p.name.toLowerCase();
          const desc = (p.description || '').toLowerCase();
          const cat = (categoryMap.get(p.categoryId) || '').toLowerCase();
          const pVariants = variantsByProduct.get(p.id) || [];
          const colors = pVariants.map((v) => (v.color || '').toLowerCase()).join(' ');

          // If looking for attire/wedding, prioritize Apparel and Accessories over Home
          if (
            (tokens.has('wedding') || tokens.has('party') || tokens.has('dinner')) &&
            cat.includes('home')
          ) {
            return false;
          }

          return tokenArray.some(
            (token) =>
              name.includes(token) ||
              desc.includes(token) ||
              cat.includes(token) ||
              colors.includes(token)
          );
        });

        if (filtered.length > 0) {
          matching = filtered;
        }
      }
    }

    // Filter by price range
    if (params.maxPrice !== undefined && params.maxPrice > 0) {
      matching = matching.filter((p) => {
        const base = parseFloat(p.basePrice.toString());
        const pVariants = variantsByProduct.get(p.id) || [];
        const lowestVariantPrice = pVariants.length
          ? Math.min(...pVariants.map((v) => parseFloat(v.price.toString())))
          : base;
        return lowestVariantPrice <= (params.maxPrice as number);
      });
    }

    if (params.minPrice !== undefined && params.minPrice > 0) {
      matching = matching.filter((p) => {
        const base = parseFloat(p.basePrice.toString());
        const pVariants = variantsByProduct.get(p.id) || [];
        const highestVariantPrice = pVariants.length
          ? Math.max(...pVariants.map((v) => parseFloat(v.price.toString())))
          : base;
        return highestVariantPrice >= (params.minPrice as number);
      });
    }

    // Filter by stock
    const inStockOnly = params.inStockOnly !== false; // default true
    if (inStockOnly) {
      matching = matching.filter((p) => {
        const pVariants = variantsByProduct.get(p.id) || [];
        const totalStock = pVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
        return totalStock > 0;
      });
    }

    // Convert to RecommendedProduct format
    const results: RecommendedProduct[] = matching.slice(0, 6).map((p) => {
      const pVariants = variantsByProduct.get(p.id) || [];
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: categoryMap.get(p.categoryId) || 'Collection',
        basePrice: parseFloat(p.basePrice.toString()),
        image: imageMap.get(p.id) || '',
        description: p.description || '',
        variants: pVariants.map((v) => ({
          id: v.id,
          sku: v.sku,
          size: v.size,
          color: v.color,
          price: parseFloat(v.price.toString()),
          stock: v.stock,
        })),
      };
    });

    return results;
  } catch (error) {
    console.error('Error in searchStoreProducts:', error);
    return [];
  }
}
