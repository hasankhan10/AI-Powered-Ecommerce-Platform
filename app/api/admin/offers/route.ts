import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin';
import { getOfferCoupons, createOfferCoupon } from '@/lib/db/offers';

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const offers = await getOfferCoupons();
    return NextResponse.json({ success: true, offers });
  } catch (err: any) {
    console.error('Error fetching offers:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch offers' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await req.json();
    const { code, discountPercent, title, description, minOrderValue, maxDiscount, isActive, expiresAt } = body;

    if (!code || !discountPercent || !title) {
      return NextResponse.json(
        { error: 'Offer code, discount percentage, and title are required.' },
        { status: 400 }
      );
    }

    const created = await createOfferCoupon({
      code,
      discountPercent: Number(discountPercent),
      title,
      description,
      minOrderValue: minOrderValue !== undefined ? Number(minOrderValue) : 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      isActive: isActive !== false,
      expiresAt: expiresAt || null,
    });

    return NextResponse.json({
      success: true,
      message: `Offer code "${created.code}" (${created.discountPercent}% OFF) created successfully.`,
      offer: created,
    });
  } catch (err: any) {
    console.error('Error creating offer:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create offer' },
      { status: 400 }
    );
  }
}
