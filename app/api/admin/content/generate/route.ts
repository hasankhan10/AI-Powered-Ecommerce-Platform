import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { generateProductCopy, optimizeProductTitle, CopyTone } from '@/lib/ai/copywriter';

function generateId() {
  return 'cg_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productId,
      name,
      title,
      categoryName,
      categoryId,
      basePrice,
      currentDescription,
      tone = 'editorial',
      type = 'DESCRIPTION',
      notes,
    } = body;

    let targetName = name || title || '';
    let targetCategoryName = categoryName || '';
    let targetBasePrice = basePrice ? parseFloat(basePrice.toString()) : 0;
    let targetDescription = currentDescription || '';

    // If productId provided, load existing product record
    if (productId) {
      const products = await db.orm.public.Product.where({ id: productId }).all();
      const product = products[0];
      if (product) {
        targetName = targetName || product.name;
        targetBasePrice = targetBasePrice || parseFloat(product.basePrice.toString());
        targetDescription = targetDescription || product.description || '';

        if (!targetCategoryName && product.categoryId) {
          const categories = await db.orm.public.Category.where({ id: product.categoryId }).all();
          if (categories[0]) {
            targetCategoryName = categories[0].name;
          }
        }
      }
    } else if (categoryId && !targetCategoryName) {
      const categories = await db.orm.public.Category.where({ id: categoryId }).all();
      if (categories[0]) {
        targetCategoryName = categories[0].name;
      }
    }

    // 1. Generate Title
    if (type === 'TITLE') {
      const optimizedTitle = await optimizeProductTitle({
        currentTitle: targetName,
        categoryName: targetCategoryName,
        notes: notes || targetDescription,
      });

      return NextResponse.json({
        success: true,
        title: optimizedTitle,
        text: optimizedTitle,
      });
    }

    // 2. Generate Description
    const generatedCopy = await generateProductCopy({
      product: {
        id: productId || 'draft',
        name: targetName || 'New Piece',
        categoryName: targetCategoryName,
        basePrice: targetBasePrice,
        currentDescription: targetDescription,
      },
      tone: tone as CopyTone,
    });

    // If existing product, optionally log to ContentGeneration
    let newGeneration: any = null;
    if (productId) {
      try {
        const generationId = generateId();
        newGeneration = await db.orm.public.ContentGeneration.create({
          id: generationId,
          productId: productId,
          type: type as any,
          tone: tone,
          generatedText: generatedCopy,
          isPublished: false,
        });
      } catch (e) {
        console.warn('Could not log ContentGeneration:', e);
      }
    }

    return NextResponse.json({
      success: true,
      description: generatedCopy,
      text: generatedCopy,
      generation: newGeneration
        ? {
            id: newGeneration.id,
            productId: newGeneration.productId,
            type: newGeneration.type,
            tone: newGeneration.tone,
            generatedText: newGeneration.generatedText,
            isPublished: newGeneration.isPublished,
          }
        : undefined,
    });
  } catch (err: any) {
    console.error('Error generating AI product content:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to generate product content' },
      { status: 500 }
    );
  }
}
