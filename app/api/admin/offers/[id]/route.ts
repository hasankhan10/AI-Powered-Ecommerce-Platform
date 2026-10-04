import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth/admin';
import { updateOfferCoupon, deleteOfferCoupon } from '@/lib/db/offers';

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteProps) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await updateOfferCoupon(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Offer "${updated.code}" updated successfully.`,
      offer: updated,
    });
  } catch (err: any) {
    console.error('Error updating offer:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to update offer' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteProps) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const { id } = await params;
    const success = await deleteOfferCoupon(id);

    if (!success) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Offer deleted successfully.',
    });
  } catch (err: any) {
    console.error('Error deleting offer:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to delete offer' },
      { status: 500 }
    );
  }
}
