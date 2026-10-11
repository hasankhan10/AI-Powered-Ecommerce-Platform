import { centralAIEngine } from '@/lib/ai/engine';

export interface ProductSeoContext {
  id?: string;
  name: string;
  categoryName?: string;
  basePrice?: number | string;
  description?: string | null;
}

export interface GeneratedSeoResult {
  metaTitle: string;
  metaDescription: string;
  slug: string;
}

/**
 * Generate SEO-optimized meta title, meta description, and clean slug via Central AI Engine.
 */
export async function generateProductSEO(
  product: ProductSeoContext
): Promise<GeneratedSeoResult> {
  const result = await centralAIEngine.orchestrateSeo(product);
  return result;
}
