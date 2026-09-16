import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { generateProductCopy, CopyTone } from '@/lib/ai/copywriter';

function generateId() {
  return 'cg_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, tone = 'editorial', type = 'DESCRIPTION' } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // 1. Fetch product & category details
    const products = await db.orm.public.Product.where({ id: productId }).all();
    const product = products[0];

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const categories = await db.orm.public.Category.where({ id: product.categoryId }).all();
    const category = categories[0];

    // 2. Generate copy via Gemini / luxury AI copywriter
    const generatedCopy = await generateProductCopy({
      product: {
        id: product.id,
        name: product.name,
        categoryName: category?.name,
        basePrice: parseFloat(product.basePrice.toString()),
        currentDescription: product.description,
      },
      tone: tone as CopyTone,
    });

    // 3. Log to ContentGeneration table
    const generationId = generateId();
    const newGeneration = await db.orm.public.ContentGeneration.create({
      id: generationId,
      productId: product.id,
      type: type as any,
      tone: tone,
      generatedText: generatedCopy,
      isPublished: false,
    });

    const createdAtStr = newGeneration.createdAt
      ? new Date(newGeneration.createdAt).toISOString()
      : new Date().toISOString();

    return NextResponse.json({
      success: true,
      generation: {
        id: newGeneration.id,
        productId: newGeneration.productId,
        productName: product.name,
        productSlug: product.slug,
        type: newGeneration.type,
        tone: newGeneration.tone,
        generatedText: newGeneration.generatedText,
        isPublished: newGeneration.isPublished,
        createdAt: createdAtStr,
      },
    });
  } catch (err: any) {
    console.error('Error generating AI product content:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate product copy' },
      { status: 500 }
    );
  }
}
