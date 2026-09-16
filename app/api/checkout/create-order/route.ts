import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { db } from '@/lib/prisma';
import { getCart, clearCart } from '@/lib/cart';
import { sendOrderConfirmationEmail } from '@/lib/email/resend';
import { getShippingSettings } from '@/lib/db/settings';

function generateId() {
  return 'c' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `MV-${timestamp}-${random}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      shippingAddress,
      customerEmail,
      customerName,
      customerPhone,
      paymentMethod = 'ONLINE',
    } = body;

    const cart = await getCart();
    if (!cart.items || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Your cart is empty' },
        { status: 400 }
      );
    }

    const shippingSettings = await getShippingSettings();
    const subtotal = cart.subtotal;
    
    // Dynamic Shipping Calculation based on Admin Settings
    let shipping = 0;
    if (shippingSettings.enableFreeDelivery) {
      shipping = subtotal >= shippingSettings.freeDeliveryThreshold ? 0 : shippingSettings.standardDeliveryFee;
    } else {
      shipping = shippingSettings.standardDeliveryFee;
    }

    const tax = 0; // Tax included in listed price
    const total = subtotal + shipping + tax;

    const orderNumber = generateOrderNumber();
    const orderId = generateId();

    // 1. Create or find Customer record
    let customerId = generateId();
    const existingCustomers = await db.orm.public.Customer.where({
      email: customerEmail,
    }).all();

    if (existingCustomers.length > 0) {
      customerId = existingCustomers[0].id;
    } else {
      await db.orm.public.Customer.create({
        id: customerId,
        supabaseUserId: `guest_${generateId()}`,
        email: customerEmail,
        name: customerName,
        phone: customerPhone,
      });
    }

    // 2. Save Shipping Address
    let addressId = generateId();
    if (shippingAddress) {
      await db.orm.public.Address.create({
        id: addressId,
        customerId,
        line1: shippingAddress.line1,
        line2: shippingAddress.line2 || null,
        city: shippingAddress.city,
        state: shippingAddress.state,
        pincode: shippingAddress.pincode,
        country: shippingAddress.country || 'India',
        isDefault: false,
      });
    }

    // 3. Handle CASH ON DELIVERY (COD)
    if (paymentMethod === 'COD') {
      // Create Order with PROCESSING status and PENDING payment (to be collected on delivery)
      await db.orm.public.Order.create({
        id: orderId,
        orderNumber,
        customerId,
        addressId,
        status: 'PROCESSING',
        subtotal: subtotal.toString(),
        shipping: shipping.toString(),
        tax: tax.toString(),
        total: total.toString(),
        paymentStatus: 'PENDING',
        paymentProvider: 'COD',
        paymentRef: `cod_${Date.now()}`,
        notes: 'Cash on Delivery — payment to be collected at doorstep',
      });

      // Populate OrderItems & Decrement Stock & Log Inventory
      for (const item of cart.items) {
        await db.orm.public.OrderItem.create({
          id: generateId(),
          orderId,
          variantId: item.variantId,
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: item.price.toString(),
        });

        // Decrement variant stock
        await db.raw.sql`
          UPDATE "ProductVariant"
          SET "stock" = GREATEST(0, "stock" - ${item.quantity})
          WHERE "id" = ${item.variantId}
        `;

        // Log inventory change
        await db.orm.public.InventoryLog.create({
          id: generateId(),
          variantId: item.variantId,
          changeQty: -item.quantity,
          reason: 'SALE',
          orderId,
        });
      }

      // Clear the customer's cart
      if (cart.cartId) {
        await clearCart(cart.cartId);
      }

      return NextResponse.json({
        success: true,
        isCOD: true,
        orderId,
        orderNumber,
        total,
        subtotal,
        shipping,
      });
    }

    // 4. ONLINE PAYMENT: Initialize Razorpay Order
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    let razorpayOrderId = `order_sim_${Date.now()}`;

    if (keyId && keySecret && !keyId.includes('rzp_test_placeholder')) {
      try {
        const razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret,
        });

        const rzpOrder = await razorpay.orders.create({
          amount: Math.round(total * 100), // in paise
          currency: 'INR',
          receipt: orderNumber,
          notes: {
            orderNumber,
            customerEmail,
          },
        });

        razorpayOrderId = rzpOrder.id;
      } catch (rzpErr) {
        console.warn('Razorpay SDK init failed, falling back to simulated mode:', rzpErr);
      }
    }

    // Create Order in Database (PENDING)
    await db.orm.public.Order.create({
      id: orderId,
      orderNumber,
      customerId,
      addressId,
      status: 'PENDING',
      subtotal: subtotal.toString(),
      shipping: shipping.toString(),
      tax: tax.toString(),
      total: total.toString(),
      paymentStatus: 'PENDING',
      paymentProvider: 'RAZORPAY',
      paymentRef: razorpayOrderId,
    });

    return NextResponse.json({
      success: true,
      isCOD: false,
      orderId,
      orderNumber,
      razorpayOrderId,
      amount: Math.round(total * 100),
      currency: 'INR',
      keyId: keyId || 'rzp_test_demo',
      total,
      subtotal,
      shipping,
    });
  } catch (error: any) {
    console.error('Error creating checkout order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
