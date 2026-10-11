import { queryRealCatalog } from '@/lib/ai/engine/catalog';
import { CatalogSearchFilter } from '@/lib/ai/engine/types';
import { RecommendedProduct } from '@/components/assistant/AssistantProductCard';

export interface AssistantSearchParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  inStockOnly?: boolean;
  limit?: number;
}

/**
 * Searches real store products by delegating to the Central AI Engine Catalog.
 */
export async function searchStoreProducts(
  params: AssistantSearchParams
): Promise<RecommendedProduct[]> {
  const result = await queryRealCatalog({
    query: params.query,
    category: params.category,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    inStockOnly: params.inStockOnly,
    limit: params.limit || 6,
  });

  return result.products;
}
