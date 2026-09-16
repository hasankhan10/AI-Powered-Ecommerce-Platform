import { db } from '@/lib/prisma';

export interface ContentProductItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  basePrice: number;
  description: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  image: string;
  status: string;
  updatedAt: string;
  generationCount: number;
  lastGeneratedAt: string | null;
}

export interface GenerationHistoryItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  type: 'DESCRIPTION' | 'SEO_TITLE' | 'SEO_DESCRIPTION' | 'SLUG_SUGGESTION';
  tone: string | null;
  generatedText: string;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export interface ContentEngineData {
  products: ContentProductItem[];
  history: GenerationHistoryItem[];
  stats: {
    totalGenerations: number;
    publishedCount: number;
    editorialCount: number;
    minimalCount: number;
    playfulCount: number;
  };
}

export async function getContentEngineData(selectedProductId?: string): Promise<ContentEngineData> {
  try {
    const [products, categories, images, generations] = await Promise.all([
      db.orm.public.Product.where({}).all(),
      db.orm.public.Category.where({}).all(),
      db.orm.public.ProductImage.where({}).all(),
      db.orm.public.ContentGeneration.where({}).all(),
    ]);

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
    const imageMap = new Map<string, string>();
    images
      .sort((a, b) => a.position - b.position)
      .forEach((img) => {
        if (!imageMap.has(img.productId)) {
          imageMap.set(img.productId, img.url);
        }
      });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Group generations by productId
    const productGenerationsMap = new Map<string, typeof generations>();
    generations.forEach((gen) => {
      const list = productGenerationsMap.get(gen.productId) || [];
      list.push(gen);
      productGenerationsMap.set(gen.productId, list);
    });

    const formattedProducts: ContentProductItem[] = products
      .map((p) => {
        const productGens = productGenerationsMap.get(p.id) || [];
        const sortedGens = [...productGens].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          category: categoryMap.get(p.categoryId) || 'Uncategorized',
          basePrice: parseFloat(p.basePrice.toString()),
          description: p.description || null,
          metaTitle: p.metaTitle || null,
          metaDescription: p.metaDescription || null,
          image: imageMap.get(p.id) || '/images/placeholder.jpg',
          status: p.status,
          updatedAt: new Date(p.updatedAt).toISOString(),
          generationCount: productGens.length,
          lastGeneratedAt: sortedGens[0]?.createdAt ? new Date(sortedGens[0].createdAt).toISOString() : null,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    // Sort generations by date descending
    const sortedGenerations = [...generations].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const formattedHistory: GenerationHistoryItem[] = sortedGenerations
      .filter((gen) => (selectedProductId ? gen.productId === selectedProductId : true))
      .map((gen) => {
        const prod = productMap.get(gen.productId);
        return {
          id: gen.id,
          productId: gen.productId,
          productName: prod ? prod.name : 'Unknown Product',
          productSlug: prod ? prod.slug : '',
          type: gen.type as any,
          tone: gen.tone,
          generatedText: gen.generatedText,
          isPublished: gen.isPublished,
          publishedAt: gen.publishedAt ? new Date(gen.publishedAt).toISOString() : null,
          createdAt: new Date(gen.createdAt).toISOString(),
        };
      });

    // Stats
    const totalGenerations = generations.length;
    const publishedCount = generations.filter((g) => g.isPublished).length;
    const editorialCount = generations.filter((g) => g.tone === 'editorial').length;
    const minimalCount = generations.filter((g) => g.tone === 'minimal').length;
    const playfulCount = generations.filter((g) => g.tone === 'playful').length;

    return {
      products: formattedProducts,
      history: formattedHistory,
      stats: {
        totalGenerations,
        publishedCount,
        editorialCount,
        minimalCount,
        playfulCount,
      },
    };
  } catch (err) {
    console.error('Error fetching content engine data:', err);
    return {
      products: [],
      history: [],
      stats: {
        totalGenerations: 0,
        publishedCount: 0,
        editorialCount: 0,
        minimalCount: 0,
        playfulCount: 0,
      },
    };
  }
}
