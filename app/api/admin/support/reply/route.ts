import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth/admin';

function generateMsgId() {
  return 'sm_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { ticketId, content, newStatus } = body;

    if (!ticketId || !content?.trim()) {
      return NextResponse.json({ error: 'Ticket ID and message content are required' }, { status: 400 });
    }

    const tickets = await db.orm.public.SupportTicket.where({ id: ticketId }).all();
    if (tickets.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // 1. Insert Agent Message
    const messageId = generateMsgId();
    await db.orm.public.SupportMessage.create({
      id: messageId,
      ticketId,
      role: 'agent',
      content: content.trim(),
    });

    // 2. Update Ticket status
    if (newStatus === 'RESOLVED' || newStatus === 'CLOSED') {
      await db.raw.sql`
        UPDATE "SupportTicket"
        SET "status" = ${newStatus}, "resolvedAt" = now(), "updatedAt" = now()
        WHERE "id" = ${ticketId}
      `;
    } else if (newStatus) {
      await db.raw.sql`
        UPDATE "SupportTicket"
        SET "status" = ${newStatus}, "updatedAt" = now()
        WHERE "id" = ${ticketId}
      `;
    } else {
      await db.raw.sql`
        UPDATE "SupportTicket"
        SET "updatedAt" = now()
        WHERE "id" = ${ticketId}
      `;
    }

    return NextResponse.json({
      success: true,
      message: {
        id: messageId,
        ticketId,
        role: 'agent',
        content: content.trim(),
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error('Error replying to support ticket:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to send reply' },
      { status: 500 }
    );
  }
}
