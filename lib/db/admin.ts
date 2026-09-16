import { db } from '@/lib/prisma';

export interface AdminOverviewData {
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    paidOrders: number;
    activeProducts: number;
    totalCustomers: number;
    aiConversations: number;
    aiConversionRate: number;
  };
  revenueTimeline: {
    date: string;
    revenue: number;
    orders: number;
  }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    customerEmail: string;
    status: string;
    paymentStatus: string;
    total: number;
    createdAt: string;
  }[];
}

export async function getAdminOverviewData(): Promise<AdminOverviewData> {
  try {
    const [orders, products, customers, conversations] = await Promise.all([
      db.orm.public.Order.where({}).all(),
      db.orm.public.Product.where({ status: 'ACTIVE' }).all(),
      db.orm.public.Customer.where({}).all(),
      db.orm.public.AssistantConversation.where({}).all(),
    ]);

    const customerMap = new Map(customers.map((c) => [c.id, c]));

    // 1. Calculate Revenue & Orders
    let totalRevenue = 0;
    let paidOrders = 0;

    const dateRevenueMap = new Map<string, { revenue: number; orders: number }>();

    orders.forEach((ord) => {
      const isPaid = ord.paymentStatus === 'PAID';
      const isConfirmedCOD = ord.paymentProvider === 'COD' && ord.status !== 'CANCELLED';
      const orderTotal = parseFloat(ord.total.toString());

      if (isPaid || isConfirmedCOD) {
        totalRevenue += orderTotal;
        paidOrders++;
      }

      // Group by Date for timeline (YYYY-MM-DD)
      const dateKey = new Date(ord.createdAt).toISOString().split('T')[0];
      const current = dateRevenueMap.get(dateKey) || { revenue: 0, orders: 0 };
      dateRevenueMap.set(dateKey, {
        revenue: current.revenue + (isPaid || isConfirmedCOD ? orderTotal : 0),
        orders: current.orders + 1,
      });
    });

    // 2. Timeline formatting (last 7 days default if empty)
    let timeline = Array.from(dateRevenueMap.entries()).map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: data.revenue,
      orders: data.orders,
    }));

    if (timeline.length === 0) {
      // Empty honest initial state
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        timeline.push({
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: 0,
          orders: 0,
        });
      }
    }

    // 3. AI metrics
    const aiConversations = conversations.length;
    const aiConversionRate =
      aiConversations > 0 ? Math.round((paidOrders / aiConversations) * 100) : 0;

    // 4. Recent Orders list
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6)
      .map((ord) => {
        const cust = customerMap.get(ord.customerId);
        return {
          id: ord.id,
          orderNumber: ord.orderNumber,
          customerEmail: cust?.email || 'Customer',
          status: ord.status,
          paymentStatus: ord.paymentStatus,
          total: parseFloat(ord.total.toString()),
          createdAt: new Date(ord.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
        };
      });

    return {
      metrics: {
        totalRevenue,
        totalOrders: orders.length,
        paidOrders,
        activeProducts: products.length,
        totalCustomers: customers.length,
        aiConversations,
        aiConversionRate,
      },
      revenueTimeline: timeline,
      recentOrders,
    };
  } catch (error) {
    console.error('Error fetching admin overview data:', error);
    return {
      metrics: {
        totalRevenue: 0,
        totalOrders: 0,
        paidOrders: 0,
        activeProducts: 0,
        totalCustomers: 0,
        aiConversations: 0,
        aiConversionRate: 0,
      },
      revenueTimeline: [],
      recentOrders: [],
    };
  }
}
