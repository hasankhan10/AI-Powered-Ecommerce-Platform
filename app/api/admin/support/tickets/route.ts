import { NextRequest, NextResponse } from 'next/server';
import { getSupportQueueData } from '@/lib/db/support';
import { getAdminSession } from '@/lib/auth/admin';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await getSupportQueueData();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Error fetching support queue:', err);
    return NextResponse.json({ error: err.message || 'Fetch failed' }, { status: 500 });
  }
}
