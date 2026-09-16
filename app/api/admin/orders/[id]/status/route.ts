import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth/admin';

const VALID_ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;
const VALID_PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const { status, paymentStatus } = body;

    const existingOrders = await db.orm.public.Order.where({ id }).all();
    const order = existingOrders[0];
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const newStatus = status || order.status;
    const newPaymentStatus = paymentStatus || order.paymentStatus;

    if (status && !VALID_ORDER_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status: ${status}. Must be one of ${VALID_ORDER_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    if (paymentStatus && !VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
      return NextResponse.json(
        { error: `Invalid paymentStatus: ${paymentStatus}. Must be one of ${VALID_PAYMENT_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    await db.orm.public.Order.where({ id }).update({
      status: newStatus as any,
      paymentStatus: newPaymentStatus as any,
      updatedAt: new Date().toISOString(),
    });

    revalidatePath('/admin/orders');
    revalidatePath('/admin');
    revalidatePath('/order-confirm');

    return NextResponse.json({
      success: true,
      orderId: id,
      status: newStatus,
      paymentStatus: newPaymentStatus,
    });
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: error.message || 'Status update failed' },
      { status: 500 }
    );
  }
}
