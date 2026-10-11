import { db } from '@/lib/prisma';

function generateId(prefix = 'c') {
  return prefix + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

export interface ConversationContextParams {
  conversationId?: string | null;
  sessionId?: string;
  customerId?: string | null;
}

export interface PersistMessageParams {
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  productIds?: string[];
}

/**
 * Ensure conversation exists or create new conversation record
 */
export async function getOrCreateConversation(
  params: ConversationContextParams
): Promise<string> {
  let conversationId = params.conversationId;

  if (conversationId) {
    try {
      const existing = await db.orm.public.AssistantConversation.where({
        id: conversationId,
      }).all();
      if (existing.length > 0) {
        return conversationId;
      }
    } catch (e) {
      // ignore check error, fallback to create
    }
  }

  conversationId = generateId('conv_');
  try {
    await db.orm.public.AssistantConversation.create({
      id: conversationId,
      customerId: params.customerId || null,
      sessionId: params.sessionId || 'guest',
    });
  } catch (err) {
    console.warn('Could not persist AssistantConversation record:', err);
  }

  return conversationId;
}

/**
 * Persist user or assistant message to database with referenced products
 */
export async function persistConversationMessage(
  params: PersistMessageParams
): Promise<void> {
  const { conversationId, role, content, productIds } = params;
  if (!conversationId || !content) return;

  try {
    await db.orm.public.AssistantMessage.create({
      id: generateId('msg_'),
      conversationId,
      role,
      content,
      productRefs: productIds && productIds.length > 0 ? JSON.stringify(productIds) : null,
    });
  } catch (err) {
    console.warn('Could not persist message to AssistantMessage table:', err);
  }
}

/**
 * Retrieve recent message history for multi-turn conversational awareness
 */
export async function getRecentConversationHistory(
  conversationId: string,
  limit = 6
): Promise<{ role: 'user' | 'assistant'; content: string }[]> {
  if (!conversationId) return [];

  try {
    const messages = await db.orm.public.AssistantMessage.where({
      conversationId,
    }).all();

    return messages
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(-limit)
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));
  } catch (err) {
    console.warn('Could not fetch message history:', err);
    return [];
  }
}
