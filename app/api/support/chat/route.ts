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

    // 1. Find or create SupportTicket
    let ticketId = incomingTicketId;
    let customerId = '';

    if (ticketId) {
      const existingTickets = await db.orm.public.SupportTicket.where({ id: ticketId }).all();
      if (existingTickets.length > 0) {
        customerId = existingTickets[0].customerId;
      } else {
        ticketId = null;
      }
    }

    if (!ticketId) {
      customerId = await getOrCreateSupportCustomer(customerEmail, customerName);
      ticketId = generateId();

      // Create new ticket
      await db.orm.public.SupportTicket.create({
        id: ticketId,
        customerId,
        subject: userText.slice(0, 60) || subject,
        status: 'OPEN',
      });
    }

    // 2. Persist Customer Message
    await db.orm.public.SupportMessage.create({
      id: generateMsgId(),
      ticketId,
      role: 'customer',
      content: userText,
    });

    // 3. Process AI Response & Tools (Order Lookup / Escalation)
    const aiResponse = await processCustomerSupportMessage({
      messages,
      customerEmail,
    });

    // 4. Persist Assistant Response
    await db.orm.public.SupportMessage.create({
      id: generateMsgId(),
      ticketId,
      role: 'assistant',
      content: aiResponse.content,
    });

    // 5. Update Ticket Status if escalated
    if (aiResponse.isEscalated) {
      await db.raw.sql`
        UPDATE "SupportTicket"
        SET "status" = 'ESCALATED', "updatedAt" = now()
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
