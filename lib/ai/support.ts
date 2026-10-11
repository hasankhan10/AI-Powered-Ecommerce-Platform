import { centralAIEngine } from '@/lib/ai/engine';
import { SupportOrderLookupResult } from '@/lib/db/support';

export interface SupportAiResponse {
  content: string;
  isEscalated: boolean;
  orderData?: SupportOrderLookupResult['order'];
}

/**
 * Process incoming customer support messages via the Central AI Engine.
 */
export async function processCustomerSupportMessage({
  messages,
  customerEmail,
}: {
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  customerEmail?: string;
}): Promise<SupportAiResponse> {
  const result = await centralAIEngine.orchestrateSupport({
    messages,
    customerEmail,
  });

  return {
    content: result.content,
    isEscalated: result.isEscalated,
    orderData: result.orderData,
  };
}
