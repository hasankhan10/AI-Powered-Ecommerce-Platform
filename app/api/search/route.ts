import { NextRequest, NextResponse } from 'next/server';
import { centralAIEngine } from '@/lib/ai/engine';
import { SearchResponse } from '@/lib/store/useSearchStore';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawQuery = (searchParams.get('q') || '').trim();

    if (!rawQuery) {
      return NextResponse.json<SearchResponse>({
        query: '',
        products: [],
        categories: [],
      });
    }

    const engineResult = await centralAIEngine.orchestrateSearch({
      query: rawQuery,
      limit: 12,
    });

    const response: SearchResponse = {
      query: rawQuery,
      parsedConstraints: {
        maxPrice: engineResult.constraints.maxPrice,
        minPrice: engineResult.constraints.minPrice,
        category: engineResult.constraints.category,
      },
      products: engineResult.products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category,
        basePrice: p.price,
        image: p.image,
        description: p.description,
        stock: p.inStock ? 10 : 0,
        inStock: p.inStock,
        score: p.score,
      })),
      categories: engineResult.categories,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Central AI Search API error:', error);
    return NextResponse.json(
      { error: error.message || 'Search execution failed' },
      { status: 500 }
    );
  }
}
