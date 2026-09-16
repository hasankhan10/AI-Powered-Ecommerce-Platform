import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { generateProductSEO } from '@/lib/ai/seo';

function generateId() {
  return 'cg_seo_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, name, categoryName, description, basePrice } = body;

    let targetName = name;
    let targetCat = categoryName;
    let targetDesc = description;
    let targetPrice = basePrice;

    // 1. If productId is provided, load product details from DB
    if (productId) {
      const products = await db.orm.public.Product.where({ id: productId }).all();
      const product = products[0];
      if (product) {
        targetName = targetName || product.name;
        targetDesc = targetDesc || product.description;
        targetPrice = targetPrice || parseFloat(product.basePrice.toString());
        const categories = await db.orm.public.Category.where({ id: product.categoryId }).all();
        targetCat = targetCat || categories[0]?.name;
      }
    }

    if (!targetName) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }

    // 2. Generate SEO metadata via Gemini
    const seoResult = await generateProductSEO({
      id: productId,
      name: targetName,
      categoryName: targetCat,
      basePrice: targetPrice,
      description: targetDesc,
    });

    let titleGenId: string | undefined;
    let descGenId: string | undefined;

    // 3. Log to ContentGeneration if productId is present
    if (productId) {
      titleGenId = generateId();
      descGenId = generateId();

      await Promise.all([
        db.orm.public.ContentGeneration.create({
          id: titleGenId,
          productId,
          type: 'SEO_TITLE' as any,
          tone: 'seo',
          generatedText: seoResult.metaTitle,
          isPublished: false,
        }),
        db.orm.public.ContentGeneration.create({
          id: descGenId,
          productId,
          type: 'SEO_DESCRIPTION' as any,
          tone: 'seo',
          generatedText: seoResult.metaDescription,
          isPublished: false,
        }),
      ]);
    }

    return NextResponse.json({
      success: true,
      seo: seoResult,
      titleGenId,
      descGenId,
    });
  } catch (err: any) {
    console.error('Error generating AI SEO metadata:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate SEO metadata' },
      { status: 500 }
    );
  }
}
