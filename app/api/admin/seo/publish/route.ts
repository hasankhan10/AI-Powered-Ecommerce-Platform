import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, metaTitle, metaDescription, slug, titleGenId, descGenId } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const products = await db.orm.public.Product.where({ id: productId }).all();
    const product = products[0];

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // 1. Update Product metadata in Postgres
    await db.raw.sql`
      UPDATE "Product"
      SET 
        "metaTitle" = ${metaTitle ?? product.metaTitle},
        "metaDescription" = ${metaDescription ?? product.metaDescription},
        "updatedAt" = now()
      WHERE "id" = ${productId}
    `;

    // 2. Mark generations as published if IDs provided
    if (titleGenId) {
      await db.raw.sql`
        UPDATE "ContentGeneration"
        SET "isPublished" = true, "publishedAt" = now()
        WHERE "id" = ${titleGenId}
      `;
    }
    if (descGenId) {
      await db.raw.sql`
        UPDATE "ContentGeneration"
        SET "isPublished" = true, "publishedAt" = now()
        WHERE "id" = ${descGenId}
      `;
    }

    // 3. Revalidate live storefront routes and sitemap
    revalidatePath(`/product/${product.slug}`);
    revalidatePath('/sitemap.xml');
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
        metaTitle,
        metaDescription,
      },
      message: 'SEO metadata published successfully and live storefront revalidated.',
    });
  } catch (err: any) {
    console.error('Error publishing SEO metadata:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to publish SEO metadata' },
      { status: 500 }
    );
  }
}
