import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth/admin';

function generateId() {
  return 'c' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      name,
      slug,
      description,
      categoryId,
      basePrice,
      status,
      metaTitle,
      metaDescription,
      variants = [],
      images = [],
    } = body;

    const existingProducts = await db.orm.public.Product.where({ id }).all();
    const currentProduct = existingProducts[0];
    if (!currentProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // 1. Update Product fields
    await db.orm.public.Product.where({ id }).update({
      name: name ?? currentProduct.name,
      slug: slug ?? currentProduct.slug,
      description: description ?? currentProduct.description,
      metaTitle: metaTitle !== undefined ? metaTitle : currentProduct.metaTitle,
      metaDescription: metaDescription !== undefined ? metaDescription : currentProduct.metaDescription,
      basePrice: (basePrice ?? currentProduct.basePrice).toString(),
      categoryId: categoryId ?? currentProduct.categoryId,
      status: (status ?? currentProduct.status) as any,
      updatedAt: new Date().toISOString(),
    });

    // 2. Update Variants & Stock
    for (const v of variants) {
      if (v.id) {
        // Update existing variant
        await db.orm.public.ProductVariant.where({ id: v.id }).update({
          size: v.size || null,
          color: v.color || null,
          price: (v.price ?? basePrice).toString(),
          stock: v.stock ?? 0,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Add new variant
        const variantId = generateId();
        const sku = v.sku || `MV-${(slug || currentProduct.slug).slice(0, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;

        await db.orm.public.ProductVariant.create({
          id: variantId,
          productId: id,
          sku,
          size: v.size || null,
          color: v.color || null,
          price: (v.price ?? basePrice).toString(),
          stock: v.stock ?? 0,
        });
      }
    }

    // 3. Update Images (if provided)
    if (images.length > 0) {
      await db.orm.public.ProductImage.where({ productId: id }).delete();
      for (let i = 0; i < images.length; i++) {
        await db.orm.public.ProductImage.create({
          id: generateId(),
          productId: id,
          url: images[i].url,
          altText: images[i].altText || `${name} image`,
          position: i,
        });
      }
    }

    // Revalidate live storefront paths
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath(`/product/${currentProduct.slug}`);
    if (slug && slug !== currentProduct.slug) {
      revalidatePath(`/product/${slug}`);
    }

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: error.message || 'Update failed' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const existingProducts = await db.orm.public.Product.where({ id }).all();
    const product = existingProducts[0];
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Cascade delete relations using ORM mutations
    const productVariants = await db.orm.public.ProductVariant.where({ productId: id }).all();
    for (const vr of productVariants) {
      await db.orm.public.InventoryLog.where({ variantId: vr.id }).delete();
    }
    await db.orm.public.ProductImage.where({ productId: id }).delete();
    await db.orm.public.ProductVariant.where({ productId: id }).delete();
    await db.orm.public.Product.where({ id }).delete();

    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath(`/product/${product.slug}`);

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: error.message || 'Delete failed' },
      { status: 500 }
    );
  }
}
