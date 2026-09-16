'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { useAssistantStore } from '@/lib/store/useAssistantStore';
import { content } from '@/config/content';
import { AssistantDrawerHeader, AssistantTab } from './AssistantDrawerHeader';
import { AssistantStarterPrompts } from './AssistantStarterPrompts';
import { AssistantMessageItem, ChatMessage } from './AssistantMessageItem';
import { AssistantInputBar } from './AssistantInputBar';
import { RecommendedProduct } from './AssistantProductCard';

export function AssistantChatDrawer() {
  const pathname = usePathname();
  const {
    isOpen,
    initialPrompt,
    productContext,
    conversationId,
    closeAssistant,
    setConversationId,
  } = useAssistantStore();

  const [activeTab, setActiveTab] = useState<AssistantTab>('stylist');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [supportTicketId, setSupportTicketId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || isLoading) return;

    setInput('');

    const userMessageId = 'u-' + Date.now();
    const assistantMessageId = 'a-' + (Date.now() + 1);

    const newMessages: ChatMessage[] = [
      ...messages,
      { id: userMessageId, role: 'user', content: messageText },
      { id: assistantMessageId, role: 'assistant', content: '', isStreaming: true },
    ];

    setMessages(newMessages);
    setIsLoading(true);

    if (activeTab === 'support') {
      try {
        const response = await fetch('/api/support/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: newMessages
              .filter((m) => !m.isStreaming)
              .map((m) => ({ role: m.role, content: m.content })),
            ticketId: supportTicketId,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Support error');

        if (data.ticketId) setSupportTicketId(data.ticketId);

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: data.content,
                  orderData: data.orderData,
                  isEscalated: data.isEscalated,
                  isStreaming: false,
                }
              : msg
          )
        );
      } catch (err: any) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: 'Our support concierge is temporarily unavailable. Please try again shortly.',
                  isStreaming: false,
                }
              : msg
          )
        );
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Stylist Mode (SSE Stream)
    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages
            .filter((m) => !m.isStreaming)
            .map((m) => ({ role: m.role, content: m.content })),
          conversationId,
          productContext,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to connect to assistant');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';
      let receivedProducts: RecommendedProduct[] = [];
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let currentEvent = 'delta';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            const rawData = line.slice(6).trim();
            if (!rawData) continue;

            try {
              const parsed = JSON.parse(rawData);

              if (currentEvent === 'delta' && parsed.text) {
                assistantText += parsed.text;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId ? { ...msg, content: assistantText } : msg
                  )
                );
              } else if (currentEvent === 'products' && Array.isArray(parsed)) {
                receivedProducts = parsed;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId ? { ...msg, products: receivedProducts } : msg
                  )
                );
              } else if (currentEvent === 'done' && parsed.conversationId) {
                setConversationId(parsed.conversationId);
              }
            } catch (err) {
              console.warn('Error parsing SSE chunk:', err);
            }
          }
        }
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: assistantText || content.assistant.errorMessage,
                products: receivedProducts,
                isStreaming: false,
              }
            : msg
        )
      );
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: content.assistant.errorMessage, isStreaming: false }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [isOpen, initialPrompt]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClearConversation = () => {
    setMessages([]);
    setConversationId(null);
    setSupportTicketId(null);
  };

  if (pathname?.startsWith('/admin') || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={closeAssistant}
      />

      {/* Slide-out Drawer */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-bg-deep border-l border-hairline shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <AssistantDrawerHeader
          activeTab={activeTab}
          hasMessages={messages.length > 0}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setMessages([]);
          }}
          onClear={handleClearConversation}
          onClose={closeAssistant}
        />

        {/* Product Context Banner */}
        {productContext && activeTab === 'stylist' && (
          <div className="px-5 py-2.5 bg-accent-brass/5 border-b border-accent-brass/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-accent-brass">
              <ShoppingBag size={13} />
              <span className="text-[11px] truncate">
                Pairing for: <strong className="font-medium">{productContext.name}</strong>
              </span>
            </div>
            <span className="text-[9px] text-text-ondark/40 font-mono">
              Active Context
            </span>
          </div>
        )}

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.length === 0 ? (
            <AssistantStarterPrompts
              activeTab={activeTab}
              onSelectPrompt={(p) => handleSendMessage(p)}
            />
          ) : (
            messages.map((msg) => (
              <AssistantMessageItem
                key={msg.id}
                message={msg}
                supportTicketId={supportTicketId}
                onNavigateProduct={closeAssistant}
              />
            ))
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-text-ondark/40 italic p-2">
              <span className="inline-block w-2 h-2 rounded-full bg-accent-brass animate-ping" />
              <span>
                {activeTab === 'stylist'
                  ? 'Curating recommendations…'
                  : 'Consulting concierge records…'}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <AssistantInputBar
          input={input}
          isLoading={isLoading}
          activeTab={activeTab}
          inputRef={inputRef}
          onInputChange={setInput}
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        />
      </div>
    </div>
  );
}
