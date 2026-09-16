import { db } from '@/lib/prisma';

export interface VariantInventoryItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  category: string;
  image: string;
  sku: string;
  size?: string | null;
  color?: string | null;
  price: number;
  stock: number;
  unitsSold30D: number;
  dailyVelocity: number;
  daysUntilStockout: number | null;
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

export interface RestockRecommendation {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  category: string;
  image: string;
  sku: string;
  variantLabel: string;
  currentStock: number;
  dailyVelocity: number;
  daysUntilStockout: number | null;
  suggestedReorderQty: number;
  unitPrice: number;
  urgency: 'CRITICAL' | 'HIGH' | 'MODERATE';
}

export interface ProductDemandPoint {
  date: string;
  actualDemand?: number;
  projectedDemand?: number;
  projectedStock?: number;
}

export interface ProductDemandForecast {
  productId: string;
  productName: string;
  currentStock: number;
  dailyVelocity: number;
  forecastPoints: ProductDemandPoint[];
}

export interface InventoryDashboardData {
  metrics: {
    totalSkus: number;
    totalUnitsInStock: number;
    outOfStockCount: number;
    lowStockCount: number;
    healthyStockCount: number;
    stockoutRiskVolume: number;
  };
  variants: VariantInventoryItem[];
  restockRecommendations: RestockRecommendation[];
  demandForecasts: ProductDemandForecast[];
  productsList: { id: string; name: string }[];
}

export async function getInventoryDashboardData(lowStockThreshold = 5): Promise<InventoryDashboardData> {
  try {
    const [products, variants, categories, images, orderItems] = await Promise.all([
      db.orm.public.Product.where({}).all(),
      db.orm.public.ProductVariant.where({}).all(),
      db.orm.public.Category.where({}).all(),
      db.orm.public.ProductImage.where({}).all(),
      db.orm.public.OrderItem.where({}).all(),
    ]);

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Primary images by productId
    const imageMap = new Map<string, string>();
    const sortedImages = [...images].sort((a, b) => (a.position || 0) - (b.position || 0));
    for (const img of sortedImages) {
      if (!imageMap.has(img.productId)) {
        imageMap.set(img.productId, img.url);
      }
    }

    // 30-day window
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Sales volume per variant
    const variantSalesMap = new Map<string, number>();
    // Daily product sales for demand forecasting
    const productDailySalesMap = new Map<string, Map<string, number>>();

    for (const item of orderItems) {
      const itemDate = new Date(item.createdAt);
      if (itemDate >= thirtyDaysAgo) {
        variantSalesMap.set(
          item.variantId,
          (variantSalesMap.get(item.variantId) || 0) + item.quantity
        );

        const dateKey = itemDate.toISOString().slice(0, 10);
        const pMap = productDailySalesMap.get(item.productId) || new Map<string, number>();
        pMap.set(dateKey, (pMap.get(dateKey) || 0) + item.quantity);
        productDailySalesMap.set(item.productId, pMap);
      }
    }

    // Process all variants
    const variantItems: VariantInventoryItem[] = variants.map((v) => {
      const prod = productMap.get(v.productId);
      const categoryName = prod ? categoryMap.get(prod.categoryId) || 'Collection' : 'Collection';
      const image = imageMap.get(v.productId) || '';
      const unitsSold = variantSalesMap.get(v.id) || 0;
      const dailyVelocity = parseFloat((unitsSold / 30).toFixed(2));
      const stock = v.stock;

      let daysUntilStockout: number | null = null;
      if (stock === 0) {
        daysUntilStockout = 0;
      } else if (dailyVelocity > 0) {
        daysUntilStockout = Math.round(stock / dailyVelocity);
      }

      let status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
      if (stock === 0) {
        status = 'OUT_OF_STOCK';
      } else if (stock <= lowStockThreshold) {
        status = 'LOW_STOCK';
      }

      return {
        id: v.id,
        productId: v.productId,
        productName: prod?.name || 'Unknown Piece',
        productSlug: prod?.slug || '',
        category: categoryName,
        image,
        sku: v.sku,
        size: v.size,
        color: v.color,
        price: parseFloat(v.price.toString()),
        stock,
        unitsSold30D: unitsSold,
        dailyVelocity,
        daysUntilStockout,
        status,
      };
    });

    // Generate Restock Recommendations
    const restockRecommendations: RestockRecommendation[] = [];

    for (const v of variantItems) {
      const isUrgent =
        v.stock === 0 ||
        v.stock <= lowStockThreshold ||
        (v.daysUntilStockout !== null && v.daysUntilStockout <= 14);

      if (isUrgent) {
        const variantLabel = [v.color, v.size].filter(Boolean).join(' / ') || v.sku;
        // 30 days target coverage with 5 unit safety buffer
        const suggestedReorderQty = Math.max(
          10,
          Math.ceil(v.dailyVelocity * 30 + lowStockThreshold - v.stock)
        );

        let urgency: 'CRITICAL' | 'HIGH' | 'MODERATE' = 'MODERATE';
        if (v.stock === 0 || (v.daysUntilStockout !== null && v.daysUntilStockout <= 3)) {
          urgency = 'CRITICAL';
        } else if (v.stock <= 3 || (v.daysUntilStockout !== null && v.daysUntilStockout <= 7)) {
          urgency = 'HIGH';
        }

        restockRecommendations.push({
          variantId: v.id,
          productId: v.productId,
          productName: v.productName,
          productSlug: v.productSlug,
          category: v.category,
          image: v.image,
          sku: v.sku,
          variantLabel,
          currentStock: v.stock,
          dailyVelocity: v.dailyVelocity,
          daysUntilStockout: v.daysUntilStockout,
          suggestedReorderQty,
          unitPrice: v.price,
          urgency,
        });
      }
    }

    // Sort by urgency: CRITICAL first, then HIGH, then lowest stock
    const urgencyOrder = { CRITICAL: 0, HIGH: 1, MODERATE: 2 };
    restockRecommendations.sort(
      (a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency] || a.currentStock - b.currentStock
    );

    // Generate Demand Forecasts for Products
    const demandForecasts: ProductDemandForecast[] = products.map((prod) => {
      const pVariants = variantItems.filter((v) => v.productId === prod.id);
      const totalStock = pVariants.reduce((sum, v) => sum + v.stock, 0);
      const prodSalesMap = productDailySalesMap.get(prod.id) || new Map<string, number>();
      const prodVelocity = pVariants.reduce((sum, v) => sum + v.dailyVelocity, 0);

      const forecastPoints: ProductDemandPoint[] = [];

      // 14 days historical
      for (let i = 14; i >= 1; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        const actual = prodSalesMap.get(dateKey) || 0;

        forecastPoints.push({
          date: label,
          actualDemand: actual,
        });
      }

      // 14 days projected forward
      let simulatedStock = totalStock;
      const expectedDailyDemand = Math.max(0.2, prodVelocity || 0.5);

      for (let i = 0; i <= 14; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() + i);
        const label = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

        if (i === 0) {
          // Connecting point
          forecastPoints.push({
            date: label,
            actualDemand: prodSalesMap.get(now.toISOString().slice(0, 10)) || 0,
            projectedDemand: expectedDailyDemand,
            projectedStock: simulatedStock,
          });
        } else {
          simulatedStock = Math.max(0, simulatedStock - expectedDailyDemand);
          // Add subtle seasonality curve
          const variance = 1 + Math.sin(i / 2) * 0.15;
          const projected = parseFloat((expectedDailyDemand * variance).toFixed(1));

          forecastPoints.push({
            date: label,
            projectedDemand: projected,
            projectedStock: Math.round(simulatedStock),
          });
        }
      }

      return {
        productId: prod.id,
        productName: prod.name,
        currentStock: totalStock,
        dailyVelocity: parseFloat(prodVelocity.toFixed(2)),
        forecastPoints,
      };
    });

    // Summary Metrics
    const totalSkus = variantItems.length;
    const totalUnitsInStock = variantItems.reduce((s, v) => s + v.stock, 0);
    const outOfStockCount = variantItems.filter((v) => v.status === 'OUT_OF_STOCK').length;
    const lowStockCount = variantItems.filter((v) => v.status === 'LOW_STOCK').length;
    const healthyStockCount = variantItems.filter((v) => v.status === 'IN_STOCK').length;
    const stockoutRiskVolume = restockRecommendations.reduce((s, r) => s + r.suggestedReorderQty, 0);

    return {
      metrics: {
        totalSkus,
        totalUnitsInStock,
        outOfStockCount,
        lowStockCount,
        healthyStockCount,
        stockoutRiskVolume,
      },
      variants: variantItems,
      restockRecommendations,
      demandForecasts,
      productsList: products.map((p) => ({ id: p.id, name: p.name })),
    };
  } catch (error) {
    console.error('Inventory aggregation error:', error);
    return {
      metrics: {
        totalSkus: 0,
        totalUnitsInStock: 0,
        outOfStockCount: 0,
        lowStockCount: 0,
        healthyStockCount: 0,
        stockoutRiskVolume: 0,
      },
      variants: [],
      restockRecommendations: [],
      demandForecasts: [],
      productsList: [],
    };
  }
}
