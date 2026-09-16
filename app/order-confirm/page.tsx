import React from 'react';
import { db } from '@/lib/prisma';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { brandConfig } from '@/config/brand.config';
import { OrderConfirmClient } from '@/components/order/OrderConfirmClient';

interface OrderConfirmPageProps {
  searchParams: Promise<{
    orderNumber?: string;
    orderId?: string;
    method?: string;
  }>;
}

export const revalidate = 0; // Live dynamic route

export const metadata = {
  title: `Order Confirmation — ${brandConfig.name}`,
  description: 'Thank you for your order with Maison Vale.',
};

export default async function OrderConfirmPage({ searchParams }: OrderConfirmPageProps) {
  const { orderNumber, orderId, method } = await searchParams;

  let order: any = null;
  let orderItems: any[] = [];
  let address: any = null;

  try {
    if (orderNumber) {
      const orders = await db.orm.public.Order.where({ orderNumber }).all();
      order = orders[0] || null;
    } else if (orderId) {
      const orders = await db.orm.public.Order.where({ id: orderId }).all();
      order = orders[0] || null;
    }

    if (order) {
      const [items, addresses, products, variants, images] = await Promise.all([
        db.orm.public.OrderItem.where({ orderId: order.id }).all(),
        order.addressId ? db.orm.public.Address.where({ id: order.addressId }).all() : [],
        db.orm.public.Product.where({}).all(),
        db.orm.public.ProductVariant.where({}).all(),
        db.orm.public.ProductImage.where({}).all(),
      ]);

      address = addresses[0] || null;

      orderItems = items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        const variant = variants.find((v) => v.id === item.variantId);
        const prodImages = images
          .filter((img) => img.productId === item.productId)
          .sort((a, b) => (a.position || 0) - (b.position || 0));

        return {
          id: item.id,
          name: product?.name ?? 'Maison Piece',
          size: variant?.size || null,
          color: variant?.color || null,
          quantity: item.quantity,
          price: parseFloat(item.priceAtPurchase.toString()),
          imageUrl: prodImages[0]?.url || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80',
        };
      });
    }
  } catch (error) {
    console.error('Error loading order confirmation:', error);
  }

  const displayOrderNumber = order?.orderNumber || orderNumber || 'MV-CONFIRMED';
  const displayTotal = order ? parseFloat(order.total.toString()) : null;
  const displaySubtotal = order ? parseFloat(order.subtotal.toString()) : null;
  const displayShipping = order ? parseFloat(order.shipping.toString()) : 0;
  const isCOD = order?.paymentProvider === 'COD' || method === 'cod';

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary text-text-ondark">
      <Navbar />
      <main className="flex-1 px-6 lg:px-12 py-12 lg:py-16">
        <OrderConfirmClient
          orderNumber={displayOrderNumber}
          orderId={order?.id || orderId}
          total={displayTotal}
          subtotal={displaySubtotal}
          shipping={displayShipping}
          isCOD={isCOD}
          orderItems={orderItems}
          address={
            address
              ? {
                  line1: address.line1,
                  line2: address.line2,
                  city: address.city,
                  state: address.state,
                  pincode: address.pincode,
                  country: address.country,
                }
              : null
          }
        />
      </main>
      <Footer />
    </div>
  );
}
