import { create } from 'zustand';

export interface ProductContext {
  id: string;
  name: string;
  slug: string;
  price?: number;
}

interface AssistantState {
  isOpen: boolean;
  initialPrompt?: string;
  productContext?: ProductContext | null;
  conversationId: string | null;
  openAssistant: (options?: {
    initialPrompt?: string;
    productContext?: ProductContext;
  }) => void;
  closeAssistant: () => void;
  setConversationId: (id: string | null) => void;
  clearContext: () => void;
}

export const useAssistantStore = create<AssistantState>((set) => ({
  isOpen: false,
  initialPrompt: undefined,
  productContext: null,
  conversationId: null,
  openAssistant: (options) =>
    set({
      isOpen: true,
      initialPrompt: options?.initialPrompt,
      productContext: options?.productContext || null,
    }),
  closeAssistant: () =>
    set({
      isOpen: false,
      initialPrompt: undefined,
      productContext: null,
    }),
  setConversationId: (conversationId) => set({ conversationId }),
  clearContext: () =>
    set({
      initialPrompt: undefined,
      productContext: null,
    }),
}));
