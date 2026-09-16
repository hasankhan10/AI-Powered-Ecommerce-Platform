'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  ShoppingBag,
  ArrowRight,
  Headphones,
  Package,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useAssistantStore } from '@/lib/store/useAssistantStore';
import { content } from '@/config/content';
import { brandConfig } from '@/config/brand.config';
import {
  AssistantProductCard,
  RecommendedProduct,
} from './AssistantProductCard';
import { SupportOrderLookupResult } from '@/lib/db/support';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: RecommendedProduct[];
  orderData?: SupportOrderLookupResult['order'];
  isEscalated?: boolean;
  isStreaming?: boolean;
}

const STYLIST_PROMPTS = [
  'Something for a summer wedding under ₹8000',
  'Breathable linen shirts for humid weather',
  'Understated evening dinner recommendations',
  'Minimalist home accents for modern living',
];

const SUPPORT_PROMPTS = [
  'Where is my order? (e.g. MV-ORD-...)',
  'What is your return and exchange policy?',
  'How long does express shipping take?',
  'I would like to speak with a human agent',
];

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

  const [activeTab, setActiveTab] = useState<'stylist' | 'support'>('stylist');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [supportTicketId, setSupportTicketId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Handle initialPrompt from context (e.g. from PDP)
  useEffect(() => {
    if (isOpen && initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

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
      // Send to Customer Support AI Endpoint
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
        if (!response.ok) {
          throw new Error(data.error || 'Support error');
        }

        if (data.ticketId) {
          setSupportTicketId(data.ticketId);
        }

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
                  content:
                    'Our support concierge is temporarily unavailable. Please try again shortly.',
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
                    msg.id === assistantMessageId
                      ? { ...msg, content: assistantText }
                      : msg
                  )
                );
              } else if (currentEvent === 'products' && Array.isArray(parsed)) {
                receivedProducts = parsed;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, products: receivedProducts }
                      : msg
                  )
                );
              } else if (currentEvent === 'done') {
                if (parsed.conversationId) {
                  setConversationId(parsed.conversationId);
                }
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
            ? {
                ...msg,
                content: content.assistant.errorMessage,
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

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
        <div className="border-b border-hairline bg-bg-primary/40">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent-brass/15 border border-accent-brass/40 flex items-center justify-center text-accent-brass">
                {activeTab === 'stylist' ? <Sparkles size={15} /> : <Headphones size={15} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-sm tracking-wide text-text-ondark">
                    {activeTab === 'stylist' ? content.assistant.title : 'Client Concierge'}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-text-ondark/50 font-light">
                  {brandConfig.name} Automated Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearConversation}
                  className="text-text-ondark/40 hover:text-accent-brass p-1.5 transition-colors rounded-md"
                  title="Clear conversation"
                >
                  <RotateCcw size={15} />
                </button>
              )}
              <button
                type="button"
                onClick={closeAssistant}
                className="text-text-ondark/40 hover:text-text-ondark p-1.5 transition-colors rounded-md"
                aria-label="Close Assistant"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 border-t border-hairline text-xs font-medium tracking-wider uppercase">
            <button
              type="button"
              onClick={() => {
                setActiveTab('stylist');
                setMessages([]);
              }}
              className={`py-2 text-center transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'stylist'
                  ? 'bg-accent-brass/10 text-accent-brass border-b-2 border-accent-brass'
                  : 'text-text-ondark/50 hover:text-text-ondark'
              }`}
            >
              <Sparkles size={12} /> Shopping Assistant
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('support');
                setMessages([]);
              }}
              className={`py-2 text-center transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'support'
                  ? 'bg-accent-brass/10 text-accent-brass border-b-2 border-accent-brass'
                  : 'text-text-ondark/50 hover:text-text-ondark'
              }`}
            >
              <Headphones size={12} /> Orders & Support
            </button>
          </div>
        </div>

        {/* Product Context Banner if viewing specific PDP */}
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
          {/* Welcome greeting if no user messages yet */}
          {messages.length === 0 ? (
            <div className="space-y-6 pt-4">
              <div className="border border-hairline bg-bg-primary/50 p-4 space-y-2 rounded-md">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-accent-brass font-medium">
                  {activeTab === 'stylist' ? <Sparkles size={13} /> : <Headphones size={13} />}
                  {activeTab === 'stylist' ? 'Maison Vale Assistant' : 'Client Concierge'}
                </div>
                <p className="text-xs text-text-ondark/80 font-light leading-relaxed">
                  {activeTab === 'stylist'
                    ? content.assistant.welcomeMessage
                    : content.support.welcomeMessage}
                </p>
              </div>

              {/* Starter prompts */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-accent-brass/80 font-medium block">
                  Suggested Inquiries
                </span>
                <div className="flex flex-col gap-2">
                  {(activeTab === 'stylist' ? STYLIST_PROMPTS : SUPPORT_PROMPTS).map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      className="w-full text-left p-2.5 text-xs text-text-ondark/70 hover:text-text-ondark bg-bg-primary/30 hover:bg-bg-primary/70 border border-hairline hover:border-accent-brass/40 transition-colors flex items-center justify-between group rounded-md"
                    >
                      <span className="truncate pr-2 font-light">{prompt}</span>
                      <ArrowRight
                        size={12}
                        className="text-accent-brass opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[90%] p-3.5 text-xs leading-relaxed rounded-md ${
                    msg.role === 'user'
                      ? 'bg-accent-brass/15 border border-accent-brass/30 text-text-ondark'
                      : 'bg-bg-primary/60 border border-hairline text-text-ondark/90'
                  }`}
                >
                  {/* Escalation Banner */}
                  {msg.isEscalated && (
                    <div className="mb-2 p-2 bg-rose-950/30 border border-rose-500/40 text-rose-300 text-[11px] flex items-center gap-1.5 rounded-md">
                      <AlertTriangle size={13} className="shrink-0" />
                      <span>Ticket #{supportTicketId?.slice(-6).toUpperCase()} Escalated to Senior Concierge</span>
                    </div>
                  )}

                  <p className="whitespace-pre-wrap font-light">
                    {msg.content}
                    {msg.isStreaming && (
                      <span className="inline-block w-1.5 h-3 ml-1 bg-accent-brass animate-pulse align-middle" />
                    )}
                  </p>

                  {/* Render Order Lookup Card if present */}
                  {msg.orderData && (
                    <div className="mt-3 p-3 bg-bg-deep border border-accent-brass/30 space-y-2 rounded-md">
                      <div className="flex items-center justify-between border-b border-hairline pb-2">
                        <div className="flex items-center gap-1.5 text-accent-brass font-medium">
                          <Package size={13} />
                          <span>Order #{msg.orderData.orderNumber}</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono">
                          {msg.orderData.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-text-ondark/70 space-y-1">
                        <p>Carrier: {msg.orderData.shippingCarrier} · Tracking: {msg.orderData.trackingNumber}</p>
                        <p>Total: {brandConfig.currency.symbol}{msg.orderData.total.toLocaleString()}</p>
                      </div>
                      {msg.orderData.items && msg.orderData.items.length > 0 && (
                        <div className="pt-1 space-y-1">
                          {msg.orderData.items.map((it, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[10px] text-text-ondark/60">
                              <span>{it.quantity}x {it.productName} ({it.size || 'OS'})</span>
                              <span>{brandConfig.currency.symbol}{it.price}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Render inline product cards if present */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-hairline pt-3">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-accent-brass font-medium">
                        <ShoppingBag size={11} />
                        Recommended Pieces ({msg.products.length})
                      </div>
                      <div className="space-y-2">
                        {msg.products.map((prod) => (
                          <AssistantProductCard
                            key={prod.id}
                            product={prod}
                            onNavigate={closeAssistant}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-text-ondark/40 italic p-2">
              <span className="inline-block w-2 h-2 rounded-full bg-accent-brass animate-ping" />
              <span>{activeTab === 'stylist' ? 'Curating recommendations…' : 'Consulting concierge records…'}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="border-t border-hairline p-4 bg-bg-primary/40">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-bg-deep border border-hairline px-3 py-2 focus-within:border-accent-brass transition-colors rounded-md"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={activeTab === 'stylist' ? content.assistant.placeholder : content.support.placeholder}
              disabled={isLoading}
              className="flex-1 bg-transparent text-xs text-text-ondark placeholder-text-ondark/30 focus:outline-none font-light"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="text-accent-brass hover:text-accent-brass-hover disabled:text-text-ondark/20 p-1 transition-colors rounded-md"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </form>

          <p className="mt-2 text-[9px] text-center text-text-ondark/30 font-light">
            AI responses may occasionally vary. Powered by Google Gemini 2.5.
          </p>
        </div>
      </div>
    </div>
  );
}
