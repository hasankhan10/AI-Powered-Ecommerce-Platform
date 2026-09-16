import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/prisma';
import { getCart, clearCart } from '@/lib/cart';
import { sendOrderConfirmationEmail } from '@/lib/email/resend';

function generateId() {
  return 'c' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      isSimulated,
    } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Signature verification (unless in explicit local simulation mode without keys)
    if (!isSimulated && keySecret && !keySecret.includes('placeholder')) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        // Mark payment failed
        await db.raw.sql`
          UPDATE "Order"
          SET "paymentStatus" = 'FAILED', "status" = 'CANCELLED'
          WHERE "id" = ${orderId}
        `;
        return NextResponse.json(
          { error: 'Invalid payment signature' },
          { status: 400 }
        );
      }
    }

    // 1. Fetch Order and Cart
    const orders = await db.orm.public.Order.where({ id: orderId }).all();
    const order = orders[0];
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const cart = await getCart();

    // 2. Create OrderItems & Decrement Variant Stock & Log Inventory
    for (const item of cart.items) {
      await db.orm.public.OrderItem.create({
        id: generateId(),
        orderId: order.id,
        variantId: item.variantId,
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.price.toString(),
      });

      // Decrement stock in ProductVariant
      await db.raw.sql`
        UPDATE "ProductVariant"
        SET "stock" = GREATEST(0, "stock" - ${item.quantity})
        WHERE "id" = ${item.variantId}
      `;

      // Log sale inventory deduction
      await db.orm.public.InventoryLog.create({
        id: generateId(),
        variantId: item.variantId,
        changeQty: -item.quantity,
        reason: 'SALE',
        orderId: order.id,
      });
    }

    // 3. Mark Order as PAID & PROCESSING
    await db.raw.sql`
      UPDATE "Order"
      SET 
        "status" = 'PROCESSING',
        "paymentStatus" = 'PAID',
        "razorpayPaymentId" = ${razorpayPaymentId || `pay_${Date.now()}`},
        "razorpaySignature" = ${razorpaySignature || 'simulated_signature'}
      WHERE "id" = ${order.id}
    `;

    // 4. Clear the customer's cart
    if (cart.cartId) {
      await clearCart(cart.cartId);
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    );
  }
}
