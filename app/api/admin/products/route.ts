import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth/admin';
import { brandConfig } from '@/config/brand.config';
import { parseProductMetadata, formatProductDescription } from '@/lib/utils/productMetadata';

function generateId() {
  return 'c' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [products, categories, images, variants] = await Promise.all([
      db.orm.public.Product.where({}).all(),
      db.orm.public.Category.where({}).all(),
      db.orm.public.ProductImage.where({}).all(),
      db.orm.public.ProductVariant.where({}).all(),
    ]);

    const categoryMap = new Map(categories.map((c) => [c.id, c]));

    const fullProducts = products.map((prod) => {
      const cat = categoryMap.get(prod.categoryId);
      const prodImages = images
        .filter((img) => img.productId === prod.id)
        .sort((a, b) => a.position - b.position);
      const prodVariants = variants.filter((v) => v.productId === prod.id);
      const meta = parseProductMetadata(prod.description);

      return {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        metaTitle: prod.metaTitle,
        metaDescription: prod.metaDescription,
        basePrice: parseFloat(prod.basePrice.toString()),
        marketPrice: meta.marketPrice,
        status: prod.status,
        category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
        images: prodImages,
        variants: prodVariants.map((v) => ({
          id: v.id,
          sku: v.sku,
          size: v.size,
          color: v.color,
          price: parseFloat(v.price.toString()),
          stock: v.stock,
        })),
      };
    });

    return NextResponse.json({ products: fullProducts, categories });
  } catch (error: any) {
    console.error('Error fetching admin products:', error);
    return NextResponse.json({ error: error.message || 'Fetch failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      slug: customSlug,
      description,
      categoryId,
      basePrice,
      status = 'ACTIVE',
      metaTitle,
      metaDescription,
      images = [],
      variants = [],
    } = body;

    if (!name || !categoryId || basePrice === undefined) {
      return NextResponse.json(
        { error: 'Name, Category, and Base Price are required' },
        { status: 400 }
      );
    }

    const slug = (customSlug || name)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check slug uniqueness
    const existing = await db.orm.public.Product.where({ slug }).all();
    if (existing.length > 0) {
      return NextResponse.json(
        { error: `Product with slug "${slug}" already exists` },
        { status: 400 }
      );
    }

    const productId = generateId();

    // 1. Create Product
    await db.orm.public.Product.create({
      id: productId,
      name,
      slug,
      description: description || null,
      basePrice: basePrice.toString(),
      categoryId,
      status,
      metaTitle: metaTitle || `${name} — ${brandConfig.name}`,
      metaDescription: metaDescription || (description ? description.slice(0, 155) : null),
    });

    // 2. Create Images
    for (let i = 0; i < images.length; i++) {
      await db.orm.public.ProductImage.create({
        id: generateId(),
        productId,
        url: images[i].url,
        altText: images[i].altText || `${name} Image ${i + 1}`,
        position: i,
      });
    }

    // 3. Create Variants & Initial Inventory Logs
    for (const v of variants) {
      const variantId = generateId();
      const cleanSize = (v.size ?? 'OS').replace(/[\s\/]/g, '');
      const cleanColor = (v.color ?? 'NAT').replace(/\s/g, '').toUpperCase().slice(0, 4);
      const sku = v.sku || `MV-${slug.slice(0, 8).toUpperCase()}-${cleanSize}-${cleanColor}`;

      await db.orm.public.ProductVariant.create({
        id: variantId,
        productId,
        sku,
        size: v.size || null,
        color: v.color || null,
        price: (v.price ?? basePrice).toString(),
        stock: v.stock ?? 0,
      });

      if (v.stock > 0) {
        await db.orm.public.InventoryLog.create({
          id: generateId(),
          variantId,
          changeQty: v.stock,
          reason: 'INITIAL_STOCK',
        });
      }
    }

    // Revalidate live storefront paths
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath(`/product/${slug}`);

    return NextResponse.json({ success: true, productId, slug });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
