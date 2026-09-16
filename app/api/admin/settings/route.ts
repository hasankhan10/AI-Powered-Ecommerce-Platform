import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAdminSession } from '@/lib/auth/admin';
import { getShippingSettings, updateShippingSettings } from '@/lib/db/settings';

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const shippingSettings = await getShippingSettings();

    return NextResponse.json({
      success: true,
      shipping: shippingSettings,
    });
  } catch (error: any) {
    console.error('Error in GET /api/admin/settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
    }

    const body = await req.json();
    const { shipping } = body;

    if (!shipping) {
      return NextResponse.json({ error: 'Missing shipping settings payload' }, { status: 400 });
    }

    const updated = await updateShippingSettings(shipping);

    revalidatePath('/admin/settings');
    revalidatePath('/checkout');
    revalidatePath('/shop');

    return NextResponse.json({
      success: true,
      message: 'Shipping and delivery settings updated successfully',
      shipping: updated,
    });
  } catch (error: any) {
    console.error('Error in PATCH /api/admin/settings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
