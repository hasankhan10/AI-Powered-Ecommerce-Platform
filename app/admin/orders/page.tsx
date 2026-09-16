import React from 'react';
import { db } from '@/lib/prisma';
import { brandConfig } from '@/config/brand.config';
import { OrderListTable, AdminOrder } from '@/components/admin/orders/OrderListTable';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: `Orders — ${brandConfig.name} Admin`,
};

export default async function AdminOrdersPage() {
  const [orders, customers, addresses, orderItems, products, variants, productImages] =
    await Promise.all([
      db.orm.public.Order.where({}).all(),
      db.orm.public.Customer.where({}).all(),
      db.orm.public.Address.where({}).all(),
      db.orm.public.OrderItem.where({}).all(),
      db.orm.public.Product.where({}).all(),
      db.orm.public.ProductVariant.where({}).all(),
      db.orm.public.ProductImage.where({}).all(),
    ]);

  const customerMap = new Map(customers.map((c) => [c.id, c]));
  const addressMap = new Map(addresses.map((a) => [a.id, a]));
  const productMap = new Map(products.map((p) => [p.id, p]));
  const variantMap = new Map(variants.map((v) => [v.id, v]));

  // Primary image per product (lowest position)
  const imageMap = new Map<string, string>();
  const sortedImages = [...productImages].sort((a, b) => (a.position || 0) - (b.position || 0));
  for (const img of sortedImages) {
    if (!imageMap.has(img.productId)) {
      imageMap.set(img.productId, img.url);
    }
  }

  // Group items by orderId
  const itemsByOrder = new Map<string, typeof orderItems>();
  for (const item of orderItems) {
    const list = itemsByOrder.get(item.orderId) || [];
    list.push(item);
    itemsByOrder.set(item.orderId, list);
  }

  // Sort orders latest first
  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const formattedOrders: AdminOrder[] = sortedOrders.map((ord) => {
    const cust = customerMap.get(ord.customerId);
    const addr = ord.addressId ? addressMap.get(ord.addressId) : null;
    const rawItems = itemsByOrder.get(ord.id) || [];

    const items = rawItems.map((ri) => {
      const prod = productMap.get(ri.productId);
      const vr = ri.variantId ? variantMap.get(ri.variantId) : null;
      const primaryImg = imageMap.get(ri.productId) || '';

      return {
        id: ri.id,
        productId: ri.productId,
        productTitle: prod?.name || 'Unknown Product',
        productImage: primaryImg,
        variantColor: vr?.color || undefined,
        variantSize: vr?.size || undefined,
        variantSku: vr?.sku || undefined,
        quantity: ri.quantity,
        priceAtPurchase: parseFloat(ri.priceAtPurchase.toString()),
      };
    });

    return {
      id: ord.id,
      orderNumber: ord.orderNumber,
      createdAt: new Date(ord.createdAt).toISOString(),
      updatedAt: new Date(ord.updatedAt).toISOString(),
      status: ord.status as AdminOrder['status'],
      paymentStatus: ord.paymentStatus as AdminOrder['paymentStatus'],
      subtotal: parseFloat(ord.subtotal.toString()),
      shipping: parseFloat(ord.shipping.toString()),
      tax: parseFloat(ord.tax.toString()),
      total: parseFloat(ord.total.toString()),
      customer: cust
        ? {
            id: cust.id,
            name: cust.name,
            email: cust.email,
            phone: cust.phone,
          }
        : null,
      shippingAddress: addr
        ? {
            street: [addr.line1, addr.line2].filter(Boolean).join(', '),
            city: addr.city,
            state: addr.state,
            postalCode: addr.pincode,
            country: addr.country,
          }
        : null,
      items,
    };
  });

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="border-b border-hairline pb-6">
        <span className="text-[10px] uppercase tracking-[0.3em] text-accent-brass font-medium">
          Management
        </span>
        <h1 className="font-serif text-3xl font-light text-text-ondark tracking-tight mt-1">
          Orders & Fulfillment
        </h1>
        <p className="text-xs text-text-ondark/50 font-light mt-1">
          Track customer purchases, update live fulfillment lifecycle, and inspect order invoices.
        </p>
      </div>

      <OrderListTable initialOrders={formattedOrders} />
    </div>
  );
}
