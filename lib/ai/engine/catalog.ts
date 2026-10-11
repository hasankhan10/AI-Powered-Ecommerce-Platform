import { db } from '@/lib/prisma';
import { RecommendedProduct } from '@/components/assistant/AssistantProductCard';
import { CatalogSearchFilter, CatalogSearchResult } from './types';

// Semantic synonym map for expansion
const SYNONYMS: Record<string, string[]> = {
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
  oud: ['oud', 'perfume', 'fragrance', 'extrait', 'imperial'],
  bag: ['bag', 'clutch', 'tote', 'handbag', 'raffia', 'leather', 'accessories'],
  bags: ['bag', 'clutch', 'tote', 'handbag', 'raffia', 'leather', 'accessories'],
  clutch: ['clutch', 'bag', 'handbag', 'accessories'],
  scarf: ['scarf', 'wrap', 'silk', 'accessories'],
  scarves: ['scarf', 'wrap', 'silk', 'accessories'],
  wrap: ['wrap', 'scarf', 'dress', 'silk', 'linen'],
  candle: ['candle', 'scent', 'home', 'living'],
  candles: ['candle', 'scent', 'home', 'living'],
  mug: ['mug', 'ceramic', 'living', 'atelier'],
  runner: ['runner', 'table', 'linen', 'living', 'decor'],
  home: ['candle', 'mug', 'runner', 'ceramic', 'decor', 'living'],
  living: ['candle', 'mug', 'runner', 'ceramic', 'decor', 'living'],
  gift: ['perfume', 'scarf', 'clutch', 'candle', 'mug', 'runner', 'belt', 'oud'],
  gifting: ['perfume', 'scarf', 'clutch', 'candle', 'mug', 'runner', 'belt', 'oud'],
};

/**
 * Access the real product database with strict validation, real pricing, and constraint evaluation.
 * Never invents products, prices, or stock.
 */
export async function queryRealCatalog(
  filter: CatalogSearchFilter
): Promise<CatalogSearchResult> {
  const [products, categories, variants, images] = await Promise.all([
    db.orm.public.Product.where({}).all(),
    db.orm.public.Category.where({}).all(),
    db.orm.public.ProductVariant.where({}).all(),
    db.orm.public.ProductImage.where({}).all(),
  ]);

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const categorySlugMap = new Map(categories.map((c) => [c.slug.toLowerCase(), c.id]));

  // Primary image map by productId
  const imageMap = new Map<string, string>();
  const sortedImages = [...images].sort((a, b) => (a.position || 0) - (b.position || 0));
  for (const img of sortedImages) {
    if (!imageMap.has(img.productId)) {
      imageMap.set(img.productId, img.url);
    }
  }

  // Variants grouped by productId
  const variantsByProduct = new Map<string, typeof variants>();
  for (const vr of variants) {
    const list = variantsByProduct.get(vr.productId) || [];
    list.push(vr);
    variantsByProduct.set(vr.productId, list);
  }

  // Active products only
  let activeProducts = products.filter((p) => p.status !== 'ARCHIVED');

  // In-stock filter
  const inStockOnly = filter.inStockOnly !== false;
  if (inStockOnly) {
    const inStockList = activeProducts.filter((p) => {
      const pVariants = variantsByProduct.get(p.id) || [];
      const totalStock = pVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
      return totalStock > 0;
    });
    if (inStockList.length > 0) {
      activeProducts = inStockList;
    }
  }

  // Helper to get real lowest price for a product
  const getProductLowestPrice = (p: typeof products[0]): number => {
    const base = parseFloat(p.basePrice.toString());
    const pVariants = variantsByProduct.get(p.id) || [];
    return pVariants.length > 0
      ? Math.min(...pVariants.map((v) => parseFloat(v.price.toString())))
      : base;
  };

  // Catalogue price bounds
  const allPrices = activeProducts.map(getProductLowestPrice);
  const lowestAvailablePrice = allPrices.length > 0 ? Math.min(...allPrices) : 2800;
  const highestAvailablePrice = allPrices.length > 0 ? Math.max(...allPrices) : 12000;

  // Category filter
  if (filter.category) {
    const catQuery = filter.category.toLowerCase().trim();
    const matchedCatId =
      categorySlugMap.get(catQuery) ||
      categories.find((c) => c.name.toLowerCase().includes(catQuery))?.id;

    if (matchedCatId) {
      const catFiltered = activeProducts.filter((p) => p.categoryId === matchedCatId);
      if (catFiltered.length > 0) {
        activeProducts = catFiltered;
      }
    }
  }

  // Price constraints evaluation
  let workingList = activeProducts;
  let hasStrictBudgetMatch = true;
  let isBudgetBelowCatalogueMinimum = false;

  if (filter.maxPrice !== undefined && filter.maxPrice > 0) {
    const targetMax = filter.maxPrice;
    const priceFiltered = workingList.filter((p) => getProductLowestPrice(p) <= targetMax);

    if (priceFiltered.length > 0) {
      workingList = priceFiltered;
      hasStrictBudgetMatch = true;
      isBudgetBelowCatalogueMinimum = false;
    } else {
      // Requested budget is strictly below the lowest price in the catalogue
      hasStrictBudgetMatch = false;
      isBudgetBelowCatalogueMinimum = targetMax < lowestAvailablePrice;
      // Sort catalogue from lowest price ascending to surface the closest luxury pieces
      workingList = [...workingList].sort(
        (a, b) => getProductLowestPrice(a) - getProductLowestPrice(b)
      );
    }
  }

  if (filter.minPrice !== undefined && filter.minPrice > 0) {
    const targetMin = filter.minPrice;
    const minFiltered = workingList.filter((p) => getProductLowestPrice(p) >= targetMin);
    if (minFiltered.length > 0) {
      workingList = minFiltered;
    }
  }

  // Token search & relevance scoring
  const scoredProducts: { product: typeof products[0]; score: number }[] = [];

  if (filter.query && filter.query.trim()) {
    const stopWords = new Set([
      'and', 'for', 'the', 'with', 'under', 'something', 'piece', 'pieces',
      'want', 'need', 'show', 'best', 'good', 'some', 'give', 'look', 'looking',
      'please', 'tell', 'about', 'recommend', 'what', 'have', 'your', 'like', 'this', 'that', 'from',
      'rs', 'rupee', 'rupees', 'inr', 'price', 'budget', 'cost', 'below', 'around', 'mujhe', 'dikhao',
      'chahiye', 'batao', 'sundar', 'achha'
    ]);

    const rawTokens = filter.query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter((t) => t.length > 1 && !stopWords.has(t) && !/^\d+$/.test(t));

    const searchTokens = new Set<string>(rawTokens);
    for (const t of rawTokens) {
      if (SYNONYMS[t]) {
        SYNONYMS[t].forEach((syn) => searchTokens.add(syn));
      }
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
      for (const p of workingList) {
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
    finalProductList = workingList;
  }

  const limit = filter.limit || 6;
  const mappedProducts: RecommendedProduct[] = finalProductList.slice(0, limit).map((p) => {
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

  return {
    products: mappedProducts,
    totalAvailable: finalProductList.length,
    hasStrictBudgetMatch,
    lowestAvailablePrice,
    highestAvailablePrice,
    requestedMaxPrice: filter.maxPrice,
    isBudgetBelowCatalogueMinimum,
  };
}

/**
 * Verify an array of product IDs strictly against real database records.
 * Returns only products that genuinely exist with accurate prices and metadata.
 */
export async function verifyProductsAgainstDb(
  productIds: string[]
): Promise<RecommendedProduct[]> {
  if (!productIds || productIds.length === 0) return [];

  const [products, categories, variants, images] = await Promise.all([
    db.orm.public.Product.where({}).all(),
    db.orm.public.Category.where({}).all(),
    db.orm.public.ProductVariant.where({}).all(),
    db.orm.public.ProductImage.where({}).all(),
  ]);

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const imageMap = new Map<string, string>();
  const sortedImages = [...images].sort((a, b) => (a.position || 0) - (b.position || 0));
  for (const img of sortedImages) {
    if (!imageMap.has(img.productId)) {
      imageMap.set(img.productId, img.url);
    }
  }

  const variantsByProduct = new Map<string, typeof variants>();
  for (const vr of variants) {
    const list = variantsByProduct.get(vr.productId) || [];
    list.push(vr);
    variantsByProduct.set(vr.productId, list);
  }

  const verified: RecommendedProduct[] = [];
  for (const id of productIds) {
    const found = products.find((p) => p.id === id || p.slug === id);
    if (found && found.status !== 'ARCHIVED') {
      const pVariants = variantsByProduct.get(found.id) || [];
      verified.push({
        id: found.id,
        name: found.name,
        slug: found.slug,
        category: categoryMap.get(found.categoryId) || 'Collection',
        basePrice: parseFloat(found.basePrice.toString()),
        image: imageMap.get(found.id) || '',
        description: found.description || '',
        variants: pVariants.map((v) => ({
          id: v.id,
          sku: v.sku,
          size: v.size,
          color: v.color,
          price: parseFloat(v.price.toString()),
          stock: v.stock,
        })),
      });
    }
  }

  return verified;
}
