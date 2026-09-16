import { NextResponse } from 'next/server';
import { getShippingSettings } from '@/lib/db/settings';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await getShippingSettings();
    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error: any) {
    console.error('Error fetching public shipping settings:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve shipping settings' },
      { status: 500 }
    );
  }
}
