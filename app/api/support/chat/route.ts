import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { processCustomerSupportMessage } from '@/lib/ai/support';
import { getOrCreateSupportCustomer } from '@/lib/db/support';

function generateId() {
  return 'st_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function generateMsgId() {
  return 'sm_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages = [],
      ticketId: incomingTicketId,
      customerEmail,
      customerName,
      subject = 'Client Inquiry',
    } = body;

    const latestMessage = messages[messages.length - 1];
    const userText = latestMessage?.content || '';

    if (!userText.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // 1. Find or create SupportTicket (resilient to DB connection issues)
    let ticketId = incomingTicketId || generateId();
    let customerId = '';

    try {
      if (incomingTicketId) {
        const existingTickets = await db.orm.public.SupportTicket.where({ id: incomingTicketId }).all();
        if (existingTickets.length > 0) {
          customerId = existingTickets[0].customerId;
        }
      }

      if (!customerId) {
        customerId = await getOrCreateSupportCustomer(customerEmail, customerName);
        await db.orm.public.SupportTicket.create({
          id: ticketId,
          customerId,
          subject: userText.slice(0, 60) || subject,
          status: 'OPEN',
        });
      }

      // Persist Customer Message
      await db.orm.public.SupportMessage.create({
        id: generateMsgId(),
        ticketId,
        role: 'customer',
        content: userText,
      });
    } catch (dbErr) {
      console.warn('Support ticket persistence skipped (database offline or unreachable):', dbErr);
    }

    // 2. Process AI Response & Tools (Order Lookup / Escalation)
    const aiResponse = await processCustomerSupportMessage({
      messages,
      customerEmail,
    });

    // 3. Persist Assistant Response if DB is available
    try {
      await db.orm.public.SupportMessage.create({
        id: generateMsgId(),
        ticketId,
        role: 'assistant',
        content: aiResponse.content,
      });

      if (aiResponse.isEscalated) {
        await db.raw.sql`
          UPDATE "SupportTicket"
          SET "status" = 'ESCALATED', "updatedAt" = now()
          WHERE "id" = ${ticketId}
        `;
      }
    } catch (dbSaveErr) {
      // Non-blocking warning
    }

    return NextResponse.json({
      success: true,
      ticketId,
      content: aiResponse.content,
      isEscalated: aiResponse.isEscalated,
      orderData: aiResponse.orderData,
    });
  } catch (err: any) {
    console.error('Error processing support chat:', err);
    return NextResponse.json(
      { error: err.message || 'Support service error' },
      { status: 500 }
    );
  }
}
