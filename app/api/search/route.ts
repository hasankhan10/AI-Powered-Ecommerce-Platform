import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { generateEmbedding, cosineSimilarity } from '@/lib/ai/embeddings';
import { SearchProductResult, SearchCategoryResult, SearchResponse } from '@/lib/store/useSearchStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawQuery = (searchParams.get('q') || '').trim();

    if (!rawQuery) {
      return NextResponse.json<SearchResponse>({
        query: '',
        products: [],
        categories: [],
      });
    }

    // 1. Natural Language Constraint Parsing
    let maxPrice: number | undefined;
    let minPrice: number | undefined;

    const maxPriceMatch = rawQuery.match(
      /(?:under|below|less than|max|up to|budget|within|₹|rs\.?)\s*(\d+[\d,]*)/i
    );
    if (maxPriceMatch) {
      maxPrice = parseInt(maxPriceMatch[1].replace(/,/g, ''), 10);
    }

    const minPriceMatch = rawQuery.match(
      /(?:above|over|more than|from|min|starting at)\s*(\d+[\d,]*)/i
    );
    if (minPriceMatch) {
      minPrice = parseInt(minPriceMatch[1].replace(/,/g, ''), 10);
    }

    // Clean query text for semantic and lexical matching
    const cleanedQuery = rawQuery
      .replace(/(?:under|below|less than|max|up to|budget|within|above|over|more than|from|min|starting at|₹|rs\.?)\s*\d+[\d,]*/gi, '')
      .replace(/[^\w\s]/g, ' ')
      .trim();

    // 2. Fetch catalogue from Prisma
    const [products, categories, variants, images] = await Promise.all([
      db.orm.public.Product.where({}).all(),
      db.orm.public.Category.where({}).all(),
      db.orm.public.ProductVariant.where({}).all(),
      db.orm.public.ProductImage.where({}).all(),
    ]);

    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const categorySlugMap = new Map(categories.map((c) => [c.slug.toLowerCase(), c.id]));

    // Identify category hint in query
    let categoryHintId: string | undefined;
    const lowerQuery = rawQuery.toLowerCase();
    for (const cat of categories) {
      if (
        lowerQuery.includes(cat.name.toLowerCase()) ||
        lowerQuery.includes(cat.slug.toLowerCase()) ||
        (cat.name.toLowerCase().includes('apparel') && (lowerQuery.includes('clothes') || lowerQuery.includes('clothing') || lowerQuery.includes('dress') || lowerQuery.includes('shirt') || lowerQuery.includes('trouser')))
      ) {
        categoryHintId = cat.id;
        break;
      }
    }

    // Primary images by productId
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

    // 3. Generate query vector for semantic search
    const effectiveSearchText = cleanedQuery || rawQuery;
    const queryVector = await generateEmbedding(effectiveSearchText);

    // Token keywords
    const queryTokens = effectiveSearchText
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 2 && !['and', 'for', 'the', 'with'].includes(t));

    // 4. Score and filter products
    const activeProducts = products.filter((p) => p.status !== 'ARCHIVED');

    const scoredProducts: (SearchProductResult & { score: number })[] = [];

    for (const product of activeProducts) {
      const cat = categoryMap.get(product.categoryId);
      const categoryName = cat?.name || 'Collection';
      const categorySlug = cat?.slug || 'all';
      const pVariants = variantsByProduct.get(product.id) || [];
      const totalStock = pVariants.reduce((sum, v) => sum + (v.stock || 0), 0);
      const inStock = totalStock > 0;
      const basePrice = parseFloat(product.basePrice.toString());

      const prices = pVariants.length > 0
        ? pVariants.map((v) => parseFloat(v.price.toString()))
        : [basePrice];
      const lowestPrice = Math.min(...prices);
      const highestPrice = Math.max(...prices);

      // Enforce Hard Constraints
      if (maxPrice !== undefined && lowestPrice > maxPrice) {
        continue; // Exclude products whose cheapest option exceeds user ceiling
      }
      if (minPrice !== undefined && highestPrice < minPrice) {
        continue;
      }

      // Compute Semantic Similarity
      const productText = `${product.name}. Category: ${categoryName}. ${product.description || ''}`;
      const productVector = await generateEmbedding(productText);
      const semanticScore = Math.max(0, cosineSimilarity(queryVector, productVector));

      // Compute Lexical Match Score
      let lexicalScore = 0;
      const lowerName = product.name.toLowerCase();
      const lowerDesc = (product.description || '').toLowerCase();
      const lowerCat = categoryName.toLowerCase();
      const lowerColors = pVariants.map((v) => (v.color || '').toLowerCase()).join(' ');

      if (lowerName.includes(effectiveSearchText.toLowerCase())) {
        lexicalScore += 1.0;
      }

      for (const token of queryTokens) {
        if (lowerName.includes(token)) lexicalScore += 0.6;
        if (lowerDesc.includes(token)) lexicalScore += 0.3;
        if (lowerCat.includes(token)) lexicalScore += 0.4;
        if (lowerColors.includes(token)) lexicalScore += 0.3;
      }

      // Category match boost
      let categoryBoost = 0;
      if (categoryHintId && product.categoryId === categoryHintId) {
        categoryBoost = 0.3;
      }

      // Stock boost
      const stockScore = inStock ? 0.2 : 0;

      // Composite hybrid score
      const finalScore = semanticScore * 0.5 + lexicalScore * 0.35 + categoryBoost + stockScore;

      // Threshold: must have some semantic or lexical relevance
      if (finalScore > 0.25 || lexicalScore > 0 || semanticScore > 0.4) {
        scoredProducts.push({
          id: product.id,
          name: product.name,
          slug: product.slug,
          category: categoryName,
          categorySlug,
          basePrice,
          image: imageMap.get(product.id) || '',
          description: product.description || '',
          stock: totalStock,
          inStock,
          score: finalScore,
        });
      }
    }

    // Sort by finalScore descending
    scoredProducts.sort((a, b) => b.score - a.score);

    // 5. Compute Matching Categories
    const matchingCategories: SearchCategoryResult[] = [];
    for (const cat of categories) {
      const isDirectMatch =
        cat.name.toLowerCase().includes(lowerQuery) ||
        cat.slug.toLowerCase().includes(lowerQuery);

      const matchingProdsInCat = scoredProducts.filter(
        (p) => p.categorySlug === cat.slug
      );

      if (isDirectMatch || matchingProdsInCat.length > 0) {
        matchingCategories.push({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          productCount: matchingProdsInCat.length,
        });
      }
    }

    return NextResponse.json<SearchResponse>({
      query: rawQuery,
      parsedConstraints: {
        maxPrice,
        minPrice,
        category: categoryHintId ? categoryMap.get(categoryHintId)?.name : undefined,
      },
      products: scoredProducts.slice(0, 10),
      categories: matchingCategories,
    });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: error.message || 'Search execution failed' },
      { status: 500 }
    );
  }
}
