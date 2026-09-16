import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth/admin';

function generateId() {
  return 'c' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { variantId, stock, delta, reason = 'RESTOCK' } = body;

    if (!variantId) {
      return NextResponse.json({ error: 'variantId is required' }, { status: 400 });
    }

    const variants = await db.orm.public.ProductVariant.where({ id: variantId }).all();
    const variant = variants[0];
    if (!variant) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 });
    }

    let newStock = variant.stock;
    let changeQty = 0;

    if (stock !== undefined) {
      newStock = Math.max(0, parseInt(stock, 10));
      changeQty = newStock - variant.stock;
    } else if (delta !== undefined) {
      const parsedDelta = parseInt(delta, 10);
      newStock = Math.max(0, variant.stock + parsedDelta);
      changeQty = parsedDelta;
    }

    // 1. Update ProductVariant stock
    await db.raw.sql`
      UPDATE "ProductVariant"
      SET "stock" = ${newStock}, "updatedAt" = now()
      WHERE "id" = ${variantId}
    `;

    // 2. Insert InventoryLog entry
    if (changeQty !== 0) {
      try {
        await db.orm.public.InventoryLog.create({
          id: generateId(),
          variantId,
          changeQty,
          reason,
        });
      } catch (logErr) {
        console.warn('Could not write InventoryLog:', logErr);
      }
    }

    // 3. Revalidate paths
    revalidatePath('/admin/inventory');
    revalidatePath('/admin/products');
    revalidatePath('/admin');
    revalidatePath('/shop');

    return NextResponse.json({
      success: true,
      variantId,
      oldStock: variant.stock,
      newStock,
      changeQty,
    });
  } catch (error: any) {
    console.error('Inventory adjustment error:', error);
    return NextResponse.json(
      { error: error.message || 'Inventory adjustment failed' },
      { status: 500 }
    );
  }
}
