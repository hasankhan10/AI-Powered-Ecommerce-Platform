import { z } from 'zod';
import { tool } from 'ai';
import { queryRealCatalog } from './catalog';
import { lookupOrderForSupport, SupportOrderLookupResult } from '@/lib/db/support';
import { content } from '@/config/content';
import { RecommendedProduct } from '@/components/assistant/AssistantProductCard';

export interface ToolExecutionContext {
  recommendedProductsCollector?: RecommendedProduct[];
  supportOrderCollector?: { order?: SupportOrderLookupResult['order'] };
  escalationCollector?: { isEscalated: boolean; reason?: string };
  customerEmail?: string;
}

/**
 * Creates the standard AI tools configured with execution collectors
 */
export function createEngineTools(ctx: ToolExecutionContext = {}) {
  const searchProductsTool = tool({
    description:
      'Search real in-stock products in the Maison Vale catalogue by category, price range, keywords, material, or occasion. If no products are under a requested budget, it returns the closest available pieces sorted by price.',
    inputSchema: z.object({
      query: z
        .string()
        .optional()
        .describe('Search keywords such as linen, silk, wedding, dress, shirt, wrap, ceramic, perfume, table runner'),
      category: z.string().optional().describe('Category name or slug'),
      minPrice: z.number().optional().describe('Minimum price in INR'),
      maxPrice: z.number().optional().describe('Maximum price in INR'),
      inStockOnly: z.boolean().default(true).describe('Filter to products currently in stock'),
    }),
    execute: async (params) => {
      const searchResult = await queryRealCatalog({
        query: params.query,
        category: params.category,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        inStockOnly: params.inStockOnly,
      });

      if (ctx.recommendedProductsCollector) {
        ctx.recommendedProductsCollector.push(...searchResult.products);
      }

      return {
        totalAvailable: searchResult.totalAvailable,
        hasStrictBudgetMatch: searchResult.hasStrictBudgetMatch,
        isBudgetBelowCatalogueMinimum: searchResult.isBudgetBelowCatalogueMinimum,
        lowestAvailablePrice: searchResult.lowestAvailablePrice,
        requestedMaxPrice: searchResult.requestedMaxPrice,
        products: searchResult.products.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          category: p.category,
          basePrice: p.basePrice,
          priceFormatted: `₹${p.basePrice.toLocaleString('en-IN')}`,
          stock: p.variants.reduce((sum, v) => sum + v.stock, 0),
          colors: p.variants.map((v) => v.color).filter(Boolean),
          sizes: p.variants.map((v) => v.size).filter(Boolean),
        })),
      };
    },
  });

  const lookupOrderStatusTool = tool({
    description:
      'Look up real order details, tracking number, and fulfillment status from the database',
    inputSchema: z.object({
      orderNumber: z
        .string()
        .describe('The order number or reference ID, e.g. MV-ORD-2024-8492 or similar'),
    }),
    execute: async ({ orderNumber }) => {
      const lookup = await lookupOrderForSupport(orderNumber, ctx.customerEmail);
      if (lookup.found && lookup.order) {
        if (ctx.supportOrderCollector) {
          ctx.supportOrderCollector.order = lookup.order;
        }
        return lookup.order;
      }
      return {
        error: `No order found with reference "${orderNumber}". Please double-check the order number.`,
      };
    },
  });

  const getStorePolicyTool = tool({
    description:
      'Retrieve verified store policy for returns, shipping, exchanges, or garment care',
    inputSchema: z.object({
      topic: z.enum(['returns', 'shipping', 'exchanges', 'care', 'general']),
    }),
    execute: async ({ topic }) => {
      return {
        policy: content.support.policy,
        topic,
      };
    },
  });

  const escalateToHumanTool = tool({
    description:
      'Escalate this support ticket to a human senior concierge officer',
    inputSchema: z.object({
      reason: z.string().describe('Reason for escalating to a human agent'),
    }),
    execute: async ({ reason }) => {
      if (ctx.escalationCollector) {
        ctx.escalationCollector.isEscalated = true;
        ctx.escalationCollector.reason = reason;
      }
      return {
        status: 'ESCALATED',
        message: content.support.escalationMessage,
        reason,
      };
    },
  });

  return {
    search_products: searchProductsTool,
    lookup_order_status: lookupOrderStatusTool,
    get_store_policy: getStorePolicyTool,
    escalate_to_human: escalateToHumanTool,
  };
}
