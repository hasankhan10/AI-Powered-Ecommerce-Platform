import { db } from '@/lib/prisma';

export interface AnalyticsRevenuePoint {
  date: string; // e.g. "12 Sep"
  fullDate: string; // "YYYY-MM-DD"
  revenue: number;
  prevRevenue: number;
  orders: number;
}

export interface AnalyticsTopProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  image: string;
  unitsSold: number;
  totalRevenue: number;
  stock: number;
  basePrice: number;
}

export interface OutOfStockDemandItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  image: string;
  inquiryCount: number;
  currentStock: number;
  estimatedLostRevenue: number;
}

export interface QuestionTheme {
  theme: string;
  description: string;
  count: number;
  percentage: number;
  sampleQueries: string[];
}

export interface CustomerSegmentsData {
  totalCustomers: number;
  newCustomers: number; // 1 order
  returningCustomers: number; // >1 orders
  newCustomerRevenue: number;
  returningCustomerRevenue: number;
  repeatPurchaseRate: number; // %
}

export interface AnalyticsDashboardData {
  metrics: {
    totalRevenue: number;
    prevPeriodRevenue: number;
    revenueGrowth: number;
    totalOrders: number;
    paidOrders: number;
    averageOrderValue: number;
    aiConversations: number;
    aiAssistedOrders: number;
    aiConversionRate: number;
    organicConversionRate: number;
  };
  revenueTimeline30D: AnalyticsRevenuePoint[];
  revenueTimeline14D: AnalyticsRevenuePoint[];
  revenueTimeline7D: AnalyticsRevenuePoint[];
  topProducts: AnalyticsTopProduct[];
  aiInsights: {
    outOfStockDemand: OutOfStockDemandItem[];
    questionThemes: QuestionTheme[];
    aiAssistedConversionRate: number;
    organicConversionRate: number;
    totalInquiriesAnalyzed: number;
  };
  customerSegments: CustomerSegmentsData;
}

export async function getAnalyticsDashboardData(): Promise<AnalyticsDashboardData> {
  try {
    const [
      orders,
      orderItems,
      products,
      categories,
      variants,
      productImages,
      customers,
      conversations,
      messages,
    ] = await Promise.all([
      db.orm.public.Order.where({}).all(),
      db.orm.public.OrderItem.where({}).all(),
      db.orm.public.Product.where({}).all(),
      db.orm.public.Category.where({}).all(),
      db.orm.public.ProductVariant.where({}).all(),
      db.orm.public.ProductImage.where({}).all(),
      db.orm.public.Customer.where({}).all(),
      db.orm.public.AssistantConversation.where({}).all(),
      db.orm.public.AssistantMessage.where({}).all(),
    ]);

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Primary images by productId
    const imageMap = new Map<string, string>();
    const sortedImages = [...productImages].sort((a, b) => (a.position || 0) - (b.position || 0));
    for (const img of sortedImages) {
      if (!imageMap.has(img.productId)) {
        imageMap.set(img.productId, img.url);
      }
    }

    // Stock per product
    const stockByProduct = new Map<string, number>();
    for (const vr of variants) {
      const current = stockByProduct.get(vr.productId) || 0;
      stockByProduct.set(vr.productId, current + (vr.stock || 0));
    }

    // 1. Total Metrics & Revenue
    const paidOrders = orders.filter((o) => o.paymentStatus === 'PAID');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + parseFloat(o.total.toString()), 0);
    const averageOrderValue = paidOrders.length > 0 ? Math.round(totalRevenue / paidOrders.length) : 0;

    // 2. Revenue Timelines (Current Period vs Previous Period)
    const now = new Date();

    const generateTimeline = (days: number): AnalyticsRevenuePoint[] => {
      const points: AnalyticsRevenuePoint[] = [];

      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

        // Previous period date (offset by 'days')
        const prevD = new Date(d);
        prevD.setDate(prevD.getDate() - days);
        const prevDateStr = prevD.toISOString().slice(0, 10);

        // Current period sum
        const currentOrders = paidOrders.filter((o) => {
          const ordDate = new Date(o.createdAt).toISOString().slice(0, 10);
          return ordDate === dateStr;
        });

        const currentRev = currentOrders.reduce(
          (sum, o) => sum + parseFloat(o.total.toString()),
          0
        );

        // Previous period sum
        const prevOrders = paidOrders.filter((o) => {
          const ordDate = new Date(o.createdAt).toISOString().slice(0, 10);
          return ordDate === prevDateStr;
        });

        const prevRev = prevOrders.reduce(
          (sum, o) => sum + parseFloat(o.total.toString()),
          0
        );

        points.push({
          date: label,
          fullDate: dateStr,
          revenue: currentRev,
          prevRevenue: prevRev,
          orders: currentOrders.length,
        });
      }

      return points;
    };

    const revenueTimeline30D = generateTimeline(30);
    const revenueTimeline14D = generateTimeline(14);
    const revenueTimeline7D = generateTimeline(7);

    // Calculate growth over past 30 days
    const current30DRev = revenueTimeline30D.reduce((s, p) => s + p.revenue, 0);
    const prev30DRev = revenueTimeline30D.reduce((s, p) => s + p.prevRevenue, 0);
    const revenueGrowth =
      prev30DRev > 0
        ? Math.round(((current30DRev - prev30DRev) / prev30DRev) * 100)
        : current30DRev > 0
        ? 100
        : 0;

    // 3. Top Products Calculation
    const productStats = new Map<string, { unitsSold: number; totalRevenue: number }>();

    for (const item of orderItems) {
      const stats = productStats.get(item.productId) || { unitsSold: 0, totalRevenue: 0 };
      const itemRev = item.quantity * parseFloat(item.priceAtPurchase.toString());
      stats.unitsSold += item.quantity;
      stats.totalRevenue += itemRev;
      productStats.set(item.productId, stats);
    }

    const topProducts: AnalyticsTopProduct[] = products
      .map((p) => {
        const stats = productStats.get(p.id) || { unitsSold: 0, totalRevenue: 0 };
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          category: categoryMap.get(p.categoryId) || 'Collection',
          image: imageMap.get(p.id) || '',
          unitsSold: stats.unitsSold,
          totalRevenue: stats.totalRevenue,
          stock: stockByProduct.get(p.id) || 0,
          basePrice: parseFloat(p.basePrice.toString()),
        };
      })
      .sort((a, b) => b.totalRevenue - a.totalRevenue || b.unitsSold - a.unitsSold);

    // 4. AI Assistant Telemetry & Insights
    const userMessages = messages.filter((m) => m.role === 'user');
    const assistantMessages = messages.filter((m) => m.role === 'assistant');

    // Count product recommendations in assistant messages
    const productMentionCounts = new Map<string, number>();
    for (const msg of assistantMessages) {
      if (msg.productRefs) {
        try {
          const refs = typeof msg.productRefs === 'string' ? JSON.parse(msg.productRefs) : msg.productRefs;
          if (Array.isArray(refs)) {
            for (const pid of refs) {
              productMentionCounts.set(pid, (productMentionCounts.get(pid) || 0) + 1);
            }
          }
        } catch {
          // ignore parsing error
        }
      }
    }

    // Out of stock demand
    const outOfStockDemand: OutOfStockDemandItem[] = [];
    for (const [prodId, count] of productMentionCounts.entries()) {
      const p = productMap.get(prodId);
      const stock = stockByProduct.get(prodId) || 0;
      if (p && stock <= 2) {
        const price = parseFloat(p.basePrice.toString());
        outOfStockDemand.push({
          id: p.id,
          name: p.name,
          slug: p.slug,
          category: categoryMap.get(p.categoryId) || 'Collection',
          image: imageMap.get(p.id) || '',
          inquiryCount: count,
          currentStock: stock,
          estimatedLostRevenue: count * price,
        });
      }
    }
    outOfStockDemand.sort((a, b) => b.inquiryCount - a.inquiryCount);

    // Theme clustering from user inquiries
    const themeRules: { theme: string; desc: string; regex: RegExp; samples: string[] }[] = [
      {
        theme: 'Occasion & Wedding Inquiries',
        desc: 'Questions seeking attire for weddings, gala dinners, or festive gatherings',
        regex: /wedding|summer|party|gala|dinner|occasion|event|reception|festive/i,
        samples: [],
      },
      {
        theme: 'Fabric & Material Craftsmanship',
        desc: 'Questions about linen, mulberry silk, breathability, and garment care',
        regex: /linen|silk|cotton|fabric|wash|care|material|handwoven|dry clean|mulberry/i,
        samples: [],
      },
      {
        theme: 'Sizing & Tailored Fit',
        desc: 'Questions regarding measurements, trouser lengths, and silhouette fitting',
        regex: /size|fit|fitting|measurement|length|small|medium|large|loose|tight/i,
        samples: [],
      },
      {
        theme: 'Budget & Price Range',
        desc: 'Inquiries with specific price caps and value requests',
        regex: /under|below|price|cost|budget|discount|worth|₹|rs/i,
        samples: [],
      },
      {
        theme: 'Gifting & Lifestyle Decor',
        desc: 'Recommendations for gifts, homeware, table runners, and ceramics',
        regex: /gift|gifting|present|home|decor|candle|runner|mug|ceramic/i,
        samples: [],
      },
    ];

    const themeCounts = new Map<string, number>();

    for (const msg of userMessages) {
      const text = msg.content;
      for (const rule of themeRules) {
        if (rule.regex.test(text)) {
          themeCounts.set(rule.theme, (themeCounts.get(rule.theme) || 0) + 1);
          if (rule.samples.length < 2 && !rule.samples.includes(text)) {
            rule.samples.push(text);
          }
        }
      }
    }

    const totalInquiries = Math.max(1, userMessages.length);
    const questionThemes: QuestionTheme[] = themeRules.map((rule) => {
      const count = themeCounts.get(rule.theme) || 0;
      return {
        theme: rule.theme,
        description: rule.desc,
        count,
        percentage: Math.round((count / totalInquiries) * 100),
        sampleQueries: rule.samples,
      };
    });

    // AI-Assisted Conversion vs Organic
    const customerIdsWithAiChat = new Set<string>();
    for (const conv of conversations) {
      if (conv.customerId) customerIdsWithAiChat.add(conv.customerId);
    }

    const aiOrdersCount = paidOrders.filter((o) => customerIdsWithAiChat.has(o.customerId)).length;
    const aiAssistedConversionRate =
      conversations.length > 0 ? Math.round((aiOrdersCount / conversations.length) * 100) : 0;

    const organicOrdersCount = paidOrders.length - aiOrdersCount;
    const organicConversionRate =
      customers.length > 0
        ? Math.round((organicOrdersCount / Math.max(1, customers.length)) * 100)
        : 0;

    // 5. Customer Segments (New vs Returning)
    const ordersPerCustomer = new Map<string, typeof orders>();
    for (const ord of paidOrders) {
      const list = ordersPerCustomer.get(ord.customerId) || [];
      list.push(ord);
      ordersPerCustomer.set(ord.customerId, list);
    }

    let newCustCount = 0;
    let returningCustCount = 0;
    let newCustRev = 0;
    let returningCustRev = 0;

    for (const [, custOrders] of ordersPerCustomer.entries()) {
      const custTotal = custOrders.reduce(
        (sum, o) => sum + parseFloat(o.total.toString()),
        0
      );

      if (custOrders.length > 1) {
        returningCustCount++;
        returningCustRev += custTotal;
      } else {
        newCustCount++;
        newCustRev += custTotal;
      }
    }

    const totalPayingCustomers = newCustCount + returningCustCount;
    const repeatPurchaseRate =
      totalPayingCustomers > 0
        ? Math.round((returningCustCount / totalPayingCustomers) * 100)
        : 0;

    const customerSegments: CustomerSegmentsData = {
      totalCustomers: customers.length,
      newCustomers: newCustCount,
      returningCustomers: returningCustCount,
      newCustomerRevenue: newCustRev,
      returningCustomerRevenue: returningCustRev,
      repeatPurchaseRate,
    };

    return {
      metrics: {
        totalRevenue,
        prevPeriodRevenue: prev30DRev,
        revenueGrowth,
        totalOrders: orders.length,
        paidOrders: paidOrders.length,
        averageOrderValue,
        aiConversations: conversations.length,
        aiAssistedOrders: aiOrdersCount,
        aiConversionRate: aiAssistedConversionRate,
        organicConversionRate,
      },
      revenueTimeline30D,
      revenueTimeline14D,
      revenueTimeline7D,
      topProducts,
      aiInsights: {
        outOfStockDemand,
        questionThemes,
        aiAssistedConversionRate,
        organicConversionRate,
        totalInquiriesAnalyzed: userMessages.length,
      },
      customerSegments,
    };
  } catch (error) {
    console.error('Analytics aggregation error:', error);
    // Graceful fallback with empty structure
    return {
      metrics: {
        totalRevenue: 0,
        prevPeriodRevenue: 0,
        revenueGrowth: 0,
        totalOrders: 0,
        paidOrders: 0,
        averageOrderValue: 0,
        aiConversations: 0,
        aiAssistedOrders: 0,
        aiConversionRate: 0,
        organicConversionRate: 0,
      },
      revenueTimeline30D: [],
      revenueTimeline14D: [],
      revenueTimeline7D: [],
      topProducts: [],
      aiInsights: {
        outOfStockDemand: [],
        questionThemes: [],
        aiAssistedConversionRate: 0,
        organicConversionRate: 0,
        totalInquiriesAnalyzed: 0,
      },
      customerSegments: {
        totalCustomers: 0,
        newCustomers: 0,
        returningCustomers: 0,
        newCustomerRevenue: 0,
        returningCustomerRevenue: 0,
        repeatPurchaseRate: 0,
      },
    };
  }
}
