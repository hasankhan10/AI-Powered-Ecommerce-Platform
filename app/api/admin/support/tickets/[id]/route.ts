import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth/admin';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const tickets = await db.orm.public.SupportTicket.where({ id }).all();
    if (tickets.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (status === 'RESOLVED' || status === 'CLOSED') {
      await db.raw.sql`
        UPDATE "SupportTicket"
        SET "status" = ${status}, "resolvedAt" = now(), "updatedAt" = now()
        WHERE "id" = ${id}
      `;
    } else if (status) {
      await db.raw.sql`
        UPDATE "SupportTicket"
        SET "status" = ${status}, "updatedAt" = now()
        WHERE "id" = ${id}
      `;
    }

    return NextResponse.json({
      success: true,
      message: `Ticket status updated to ${status}`,
    });
  } catch (err: any) {
    console.error('Error updating support ticket status:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to update ticket status' },
      { status: 500 }
    );
  }
}
