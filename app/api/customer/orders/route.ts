import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const url = new URL(req.url);
    const emailParam = url.searchParams.get('email');
    const targetEmail = user?.email || emailParam;

    if (!targetEmail) {
      return NextResponse.json({ orders: [] });
    }

    const customers = await db.orm.public.Customer.where({ email: targetEmail }).all();
    if (customers.length === 0) {
      return NextResponse.json({ orders: [] });
    }

    const customer = customers[0];
    const [orders, orderItems, products, variants] = await Promise.all([
      db.orm.public.Order.where({ customerId: customer.id }).all(),
      db.orm.public.OrderItem.where({}).all(),
      db.orm.public.Product.where({}).all(),
      db.orm.public.ProductVariant.where({}).all(),
    ]);

    const itemsByOrder = new Map<string, typeof orderItems>();
    orderItems.forEach((it) => {
      if (!itemsByOrder.has(it.orderId)) {
        itemsByOrder.set(it.orderId, []);
      }
      itemsByOrder.get(it.orderId)!.push(it);
    });

    const formattedOrders = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((ord) => {
        const items = itemsByOrder.get(ord.id) || [];
        return {
          id: ord.id,
          orderNumber: ord.orderNumber,
          createdAt: ord.createdAt,
          status: ord.status,
          paymentStatus: ord.paymentStatus,
          total: parseFloat(ord.total.toString()),
          itemsCount: items.reduce((acc, i) => acc + i.quantity, 0),
          items: items.map((i) => {
            const prod = products.find((p) => p.id === i.productId);
            const variant = variants.find((v) => v.id === i.variantId);
            return {
              id: i.id,
              productName: prod?.name || 'Item',
              size: variant?.size,
              color: variant?.color,
              price: parseFloat(i.priceAtPurchase.toString()),
              quantity: i.quantity,
            };
          }),
        };
      });

    return NextResponse.json({ orders: formattedOrders });
  } catch (error: any) {
    console.error('Error fetching customer orders:', error);
    return NextResponse.json({ orders: [] });
  }
}
