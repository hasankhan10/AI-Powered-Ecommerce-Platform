import { NextRequest, NextResponse } from 'next/server';
import { validateOfferCode } from '@/lib/db/offers';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal = 0 } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Please enter a valid promo code.' },
        { status: 400 }
      );
    }

    const result = await validateOfferCode(code, Number(subtotal) || 0);

    if (!result.valid) {
      return NextResponse.json(
        { error: result.error || 'Invalid offer code.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      offer: {
        id: result.offer?.id,
        code: result.offer?.code,
        discountPercent: result.offer?.discountPercent,
        title: result.offer?.title,
        description: result.offer?.description,
      },
      discountAmount: result.discountAmount,
      finalTotal: result.finalTotal,
    });
  } catch (err: any) {
    console.error('Error in /api/offers/validate:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to validate promo code.' },
      { status: 500 }
    );
  }
}
