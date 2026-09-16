import { generateText, tool } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { brandConfig } from '@/config/brand.config';
import { content } from '@/config/content';
import { lookupOrderForSupport, SupportOrderLookupResult } from '@/lib/db/support';

export interface SupportAiResponse {
  content: string;
  isEscalated: boolean;
  orderData?: SupportOrderLookupResult['order'];
}

export async function processCustomerSupportMessage({
  messages,
  customerEmail,
}: {
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  customerEmail?: string;
}): Promise<SupportAiResponse> {
  const latestMessage = messages[messages.length - 1]?.content || '';
  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GEMINI_API_KEY;

  let isEscalated = false;
  let orderData: SupportOrderLookupResult['order'] | undefined;

  const systemInstruction = `You are the Client Concierge for ${brandConfig.name}, an ultra-premium luxury house.
Your tone is empathetic, gracious, composed, and efficient.
You assist clients with order status, tracking, returns, exchanges, sizing, and garment care.

Store Policies to honor:
${content.support.policy}

Tools Available:
1. lookup_order_status: Use whenever a client asks about an order or provides an order number (e.g., MV-ORD-..., #1001, or any order identifier).
2. get_store_policy: Use to look up specific return, shipping, or exchange guidelines.
3. escalate_to_human: Use whenever a client explicitly requests to talk to a human agent, senior representative, or when an issue cannot be resolved automatedly.

Never make up tracking numbers or order statuses. Always use the lookup tool. If a ticket is escalated, reassure the client that a Senior Concierge Officer has been assigned and will follow up promptly.`;

  if (
    apiKey &&
    !apiKey.includes('placeholder') &&
    !apiKey.includes('your-gemini-api-key') &&
    apiKey.trim().length > 10
  ) {
    try {
      const google = createGoogleGenerativeAI({ apiKey });
      const result = await generateText({
        model: google('gemini-2.5-flash'),
        system: systemInstruction,
        messages: messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
        tools: {
          lookup_order_status: tool({
            description: 'Look up real order details, tracking number, and fulfillment status from the database',
            inputSchema: z.object({
              orderNumber: z.string().describe('The order number or reference ID, e.g. MV-ORD-2024-8492 or similar'),
            }),
            execute: async ({ orderNumber }) => {
              const lookup = await lookupOrderForSupport(orderNumber, customerEmail);
              if (lookup.found && lookup.order) {
                orderData = lookup.order;
                return lookup.order;
              }
              return { error: `No order found with reference "${orderNumber}". Please double-check the order number.` };
            },
          }),
          get_store_policy: tool({
            description: 'Retrieve verified store policy for returns, shipping, exchanges, or garment care',
            inputSchema: z.object({
              topic: z.enum(['returns', 'shipping', 'exchanges', 'care', 'general']),
            }),
            execute: async ({ topic }) => {
              return { policy: content.support.policy, topic };
            },
          }),
          escalate_to_human: tool({
            description: 'Escalate this support ticket to a human senior concierge officer',
            inputSchema: z.object({
              reason: z.string().describe('Reason for escalating to a human agent'),
            }),
            execute: async ({ reason }) => {
              isEscalated = true;
              return {
                status: 'ESCALATED',
                message: content.support.escalationMessage,
                reason,
              };
            },
          }),
        },
      });

      if (result.text && result.text.trim().length > 0) {
        return {
          content: result.text.trim(),
          isEscalated: isEscalated || checkEscalationKeywords(latestMessage),
          orderData,
        };
      }
    } catch (err) {
      console.warn('Gemini Customer Support AI call failed, switching to deterministic concierge fallback:', err);
    }
  }

  // Graceful bespoke fallback
  return runFallbackSupportLogic(latestMessage);
}

function checkEscalationKeywords(text: string): boolean {
  const normalized = text.toLowerCase();
  const keywords = [
    'human',
    'agent',
    'representative',
    'person',
    'speak to someone',
    'talk to someone',
    'escalate',
    'complaint',
    'lawyer',
    'supervisor',
    'manager',
  ];
  return keywords.some((kw) => normalized.includes(kw));
}

async function runFallbackSupportLogic(userText: string): Promise<SupportAiResponse> {
  const normalized = userText.toLowerCase();

  // 1. Check for human escalation request
  if (checkEscalationKeywords(normalized)) {
    return {
      content: `I have immediately escalated your inquiry to our Senior Concierge Team. A dedicated client advisor will review your account and reach out directly within 24 hours. ${content.support.escalationMessage}`,
      isEscalated: true,
    };
  }

  // 2. Check for order number pattern (e.g. MV-ORD-..., or number sequences)
  const orderMatch = userText.match(/(?:MV-ORD-[\w-]+|ORD-[\w-]+|#?([0-9]{4,}))/i);
  if (orderMatch || normalized.includes('where is my order') || normalized.includes('track order') || normalized.includes('order status')) {
    const queryTerm = orderMatch ? orderMatch[0] : '';
    if (queryTerm) {
      const lookup = await lookupOrderForSupport(queryTerm);
      if (lookup.found && lookup.order) {
        const ord = lookup.order;
        const itemsList = ord.items.map((i) => `• ${i.quantity}x ${i.productName} (${i.size || 'OS'}, ${i.color || 'Natural'})`).join('\n');
        return {
          content: `Here are the live tracking details for your order **${ord.orderNumber}**:\n\n• **Fulfillment Status:** ${ord.status}\n• **Carrier:** ${ord.shippingCarrier}\n• **Tracking Number:** ${ord.trackingNumber}\n• **Total:** ${brandConfig.currency.symbol}${ord.total.toLocaleString()}\n\n**Items:**\n${itemsList}\n\nYour package is being handled with care. You can track live updates at [${ord.shippingCarrier} Tracking](${ord.trackingUrl}).`,
          isEscalated: false,
          orderData: ord,
        };
      }
    }

    // If generic order question without specific number, try finding latest order or prompt
    return {
      content: `I would be delighted to assist with tracking your shipment. Please provide your order number (e.g., **MV-ORD-...**) or the email address used during checkout, and I will pull up the real-time fulfillment status for you.`,
      isEscalated: false,
    };
  }

  // 3. Check for return / exchange policies
  if (normalized.includes('return') || normalized.includes('exchange') || normalized.includes('refund')) {
    return {
      content: `**Maison Vale Return & Exchange Policy:**\n\n• **14-Day Window:** We accept returns and size/colour exchanges within 14 days of delivery for unworn items in original packaging.\n• **Complimentary Pickups:** Our courier partner will arrange a doorstep inspection and pickup.\n• **Refunds:** Once received at our atelier, refunds are processed back to your original payment method within 3–5 business days.\n\nWould you like me to initiate a return or exchange for an existing order?`,
      isEscalated: false,
    };
  }

  // 4. Check for shipping questions
  if (normalized.includes('shipping') || normalized.includes('delivery') || normalized.includes('dispatch') || normalized.includes('how long')) {
    return {
      content: `**Shipping & Delivery Guidelines:**\n\n• **Complimentary Shipping:** Free standard delivery on all domestic orders above ₹2,000.\n• **Delivery Timelines:** Standard delivery arrives in 3–5 business days across India. Express courier arrives in 1–2 business days.\n• **Courier Partners:** Handled securely via Bluedart and premium freight handlers with active SMS/Email tracking.`,
      isEscalated: false,
    };
  }

  // 5. Default gracious concierge response
  return {
    content: `${content.support.welcomeMessage}\n\nI can assist you with real-time order tracking, return requests, garment care recommendations, or connect you directly with our senior concierge team. How may I help you today?`,
    isEscalated: false,
  };
}
