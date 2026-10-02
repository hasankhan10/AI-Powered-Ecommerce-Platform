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

// Semantic synonyms and intent expansion dictionary
const SYNONYMS: Record<string, string[]> = {
  // Occasions
  wedding: ['silk', 'linen', 'trouser', 'shirt', 'clutch', 'scarf', 'wrap', 'dress', 'blazer'],
  summer: ['linen', 'cotton', 'silk', 'raffia', 'wrap', 'shirt', 'dress'],
  evening: ['silk', 'clutch', 'blazer', 'trouser', 'scarf', 'perfume', 'oud'],
  dinner: ['linen', 'silk', 'clutch', 'shirt', 'perfume'],
  party: ['silk', 'clutch', 'trouser', 'wrap', 'scarf', 'perfume', 'oud'],
  festive: ['silk', 'linen', 'scarf', 'clutch', 'perfume'],
  formal: ['blazer', 'trouser', 'silk', 'shirt', 'clutch'],
  casual: ['shirt', 'trouser', 'wrap', 'linen', 'cotton'],
  resort: ['linen', 'wrap', 'raffia', 'cotton', 'shirt'],
  winter: ['cashmere', 'wool', 'blazer', 'scarf', 'wrap', 'tobacco'],

  // Categories & Items
  shirt: ['shirt', 'tunic', 'top', 'blouse', 'apparel'],
  shirts: ['shirt', 'tunic', 'top', 'blouse', 'apparel'],
  dress: ['dress', 'gown', 'wrap', 'tunic', 'silk'],
  dresses: ['dress', 'gown', 'wrap', 'tunic', 'silk'],
  pant: ['trouser', 'pant', 'pants', 'bottom'],
  pants: ['trouser', 'pant', 'pants', 'bottom'],
  trouser: ['trouser', 'pant', 'pants', 'bottom'],
  trousers: ['trouser', 'pant', 'pants', 'bottom'],
  perfume: ['perfume', 'parfumerie', 'oud', 'fragrance', 'extrait', 'scent', 'amber', 'vetiver'],
  perfumes: ['perfume', 'parfumerie', 'oud', 'fragrance', 'extrait', 'scent', 'amber', 'vetiver'],
  fragrance: ['perfume', 'parfumerie', 'oud', 'fragrance', 'extrait', 'scent', 'amber', 'vetiver'],
  fragrances: ['perfume', 'parfumerie', 'oud', 'fragrance', 'extrait', 'scent', 'amber', 'vetiver'],
  scent: ['perfume', 'oud', 'fragrance', 'scent', 'amber', 'candle'],
  scents: ['perfume', 'oud', 'fragrance', 'scent', 'amber', 'candle'],
  oud: ['oud', 'perfume', 'fragrance', 'extrait', 'imperial'],
  bag: ['bag', 'clutch', 'tote', 'handbag', 'raffia', 'leather', 'accessories'],
  bags: ['bag', 'clutch', 'tote', 'handbag', 'raffia', 'leather', 'accessories'],
  clutch: ['clutch', 'bag', 'handbag', 'accessories'],
  scarf: ['scarf', 'wrap', 'silk', 'accessories'],
  scarves: ['scarf', 'wrap', 'silk', 'accessories'],
  wrap: ['wrap', 'scarf', 'dress', 'silk', 'linen'],
  candle: ['candle', 'scent', 'home', 'living'],
  candles: ['candle', 'scent', 'home', 'living'],
  home: ['candle', 'mug', 'runner', 'ceramic', 'decor', 'living'],
  living: ['candle', 'mug', 'runner', 'ceramic', 'decor', 'living'],
  gift: ['perfume', 'scarf', 'clutch', 'candle', 'mug', 'runner', 'belt', 'oud'],
  gifting: ['perfume', 'scarf', 'clutch', 'candle', 'mug', 'runner', 'belt', 'oud'],
  men: ['shirt', 'trouser', 'oud', 'blazer', 'perfume'],
  mens: ['shirt', 'trouser', 'oud', 'blazer', 'perfume'],
  women: ['dress', 'silk', 'clutch', 'wrap', 'scarf', 'shirt', 'trouser', 'perfume'],
  womens: ['dress', 'silk', 'clutch', 'wrap', 'scarf', 'shirt', 'trouser', 'perfume'],
  linen: ['linen', 'shirt', 'trouser', 'wrap', 'runner'],
  silk: ['silk', 'wrap', 'scarf', 'dress', 'tunic'],
  cotton: ['cotton', 'shirt', 'trouser', 'apparel'],
};

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

    // Filter by stock (default true)
    const inStockOnly = params.inStockOnly !== false;
    if (inStockOnly) {
      const inStockList = matching.filter((p) => {
        const pVariants = variantsByProduct.get(p.id) || [];
        const totalStock = pVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
        return totalStock > 0;
      });
      if (inStockList.length > 0) {
        matching = inStockList;
      }
    }

    // Filter by category if explicitly specified
    if (params.category) {
      const catQuery = params.category.toLowerCase().trim();
      const matchedCatId =
        categorySlugMap.get(catQuery) ||
        categories.find((c) => c.name.toLowerCase().includes(catQuery))?.id;

      if (matchedCatId) {
        const catFiltered = matching.filter((p) => p.categoryId === matchedCatId);
        if (catFiltered.length > 0) {
          matching = catFiltered;
        }
      }
    }

    // Helper to extract lowest price for a product
    const getProductLowestPrice = (p: typeof products[0]) => {
      const base = parseFloat(p.basePrice.toString());
      const pVariants = variantsByProduct.get(p.id) || [];
      return pVariants.length
        ? Math.min(...pVariants.map((v) => parseFloat(v.price.toString())))
        : base;
    };

    // Filter by price range intelligently
    let hasStrictMaxPriceMatch = false;
    if (params.maxPrice !== undefined && params.maxPrice > 0) {
      const targetMax = params.maxPrice as number;
      const priceFiltered = matching.filter((p) => getProductLowestPrice(p) <= targetMax);
      if (priceFiltered.length > 0) {
        matching = priceFiltered;
        hasStrictMaxPriceMatch = true;
      } else {
        // No items <= maxPrice exist in the catalogue:
        // Sort products by lowest price ascending so the user receives the closest available luxury pieces!
        matching.sort((a, b) => getProductLowestPrice(a) - getProductLowestPrice(b));
      }
    }

    if (params.minPrice !== undefined && params.minPrice > 0) {
      const targetMin = params.minPrice as number;
      const minFiltered = matching.filter((p) => {
        const base = parseFloat(p.basePrice.toString());
        const pVariants = variantsByProduct.get(p.id) || [];
        const highestVariantPrice = pVariants.length
          ? Math.max(...pVariants.map((v) => parseFloat(v.price.toString())))
          : base;
        return highestVariantPrice >= targetMin;
      });
      if (minFiltered.length > 0) {
        matching = minFiltered;
      }
    }

    // Relevance scoring for search query tokens
    const scoredProducts: { product: typeof products[0]; score: number }[] = [];

    if (params.query && params.query.trim()) {
      const stopWords = new Set([
        'and', 'for', 'the', 'with', 'under', 'something', 'piece', 'pieces',
        'want', 'need', 'show', 'best', 'good', 'some', 'give', 'look', 'looking',
        'please', 'tell', 'about', 'recommend', 'what', 'have', 'your', 'like', 'this', 'that', 'from',
        'rs', 'rupee', 'rupees', 'inr', 'price', 'budget', 'cost', 'below', 'around'
      ]);

      const rawTokens = params.query
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter((t) => t.length > 1 && !stopWords.has(t) && !/^\d+$/.test(t));

      const searchTokens = new Set<string>(rawTokens);
      for (const t of rawTokens) {
        // Expand synonyms
        if (SYNONYMS[t]) {
          SYNONYMS[t].forEach((syn) => searchTokens.add(syn));
        }
        // Stemming s/es
        if (t.endsWith('s') && t.length > 3) {
          const stem = t.slice(0, -1);
          searchTokens.add(stem);
          if (SYNONYMS[stem]) {
            SYNONYMS[stem].forEach((syn) => searchTokens.add(syn));
          }
        }
      }

      const tokenArray = Array.from(searchTokens);

      if (tokenArray.length > 0) {
        for (const p of matching) {
          let score = 0;
          const name = p.name.toLowerCase();
          const desc = (p.description || '').toLowerCase();
          const cat = (categoryMap.get(p.categoryId) || '').toLowerCase();
          const pVariants = variantsByProduct.get(p.id) || [];
          const colors = pVariants.map((v) => (v.color || '').toLowerCase()).join(' ');

          for (const token of tokenArray) {
            if (name.includes(token)) {
              score += name.startsWith(token) ? 14 : 8;
            }
            if (cat.includes(token)) {
              score += 6;
            }
            if (colors.includes(token)) {
              score += 4;
            }
            if (desc.includes(token)) {
              score += 2;
            }
          }

          if (score > 0) {
            scoredProducts.push({ product: p, score });
          }
        }

        // Sort scored products by relevance score descending, then price proximity
        scoredProducts.sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return getProductLowestPrice(a.product) - getProductLowestPrice(b.product);
        });
      }
    }

    let finalProductList: typeof products[0][] = [];
    if (scoredProducts.length > 0) {
      finalProductList = scoredProducts.map((sp) => sp.product);
    } else {
      // If no token search matches or query is purely budget-related:
      if (params.maxPrice !== undefined && params.maxPrice > 0) {
        // Order strictly from lowest price ascending (closest to budget)
        finalProductList = [...matching].sort(
          (a, b) => getProductLowestPrice(a) - getProductLowestPrice(b)
        );
      } else {
        finalProductList = matching;
      }
    }

    // Convert up to 6 products into RecommendedProduct format
    const results: RecommendedProduct[] = finalProductList.slice(0, 6).map((p) => {
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
