import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, text, generationId } = body;

    if (!productId || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Product ID and text are required' },
        { status: 400 }
      );
    }

    // 1. Find product
    const products = await db.orm.public.Product.where({ id: productId }).all();
    const product = products[0];

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // 2. Update Product description in Postgres
    await db.raw.sql`
      UPDATE "Product"
      SET "description" = ${text}, "updatedAt" = now()
      WHERE "id" = ${productId}
    `;

    // 3. Mark generation as published if generationId provided
    if (generationId) {
      await db.raw.sql`
        UPDATE "ContentGeneration"
        SET "isPublished" = true, "publishedAt" = now()
        WHERE "id" = ${generationId}
      `;
    }

    // 4. Revalidate storefront paths so changes are live immediately
    revalidatePath(`/product/${product.slug}`);
    revalidatePath('/shop');
    revalidatePath('/');
    revalidatePath('/admin/content-seo');
    revalidatePath('/admin/products');

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: text,
      },
      message: 'Product description published successfully and storefront revalidated.',
    });
  } catch (err: any) {
    console.error('Error publishing product copy:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to publish product copy' },
      { status: 500 }
    );
  }
}
