import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    const [generations, products] = await Promise.all([
      db.orm.public.ContentGeneration.where({}).all(),
      db.orm.public.Product.where({}).all(),
    ]);

    const productMap = new Map(products.map((p) => [p.id, p]));

    const filtered = generations
      .filter((g) => (productId ? g.productId === productId : true))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const history = filtered.map((g) => {
      const prod = productMap.get(g.productId);
      return {
        id: g.id,
        productId: g.productId,
        productName: prod ? prod.name : 'Unknown Product',
        productSlug: prod ? prod.slug : '',
        type: g.type,
        tone: g.tone,
        generatedText: g.generatedText,
        isPublished: g.isPublished,
        publishedAt: g.publishedAt ? new Date(g.publishedAt).toISOString() : null,
        createdAt: new Date(g.createdAt).toISOString(),
      };
    });

    return NextResponse.json({ success: true, history });
  } catch (err: any) {
    console.error('Error fetching content history:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
