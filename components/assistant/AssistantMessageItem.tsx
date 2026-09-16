'use client';

import React from 'react';
import { AlertTriangle, Package, ShoppingBag } from 'lucide-react';
import { brandConfig } from '@/config/brand.config';
import { AssistantProductCard, RecommendedProduct } from './AssistantProductCard';
import { SupportOrderLookupResult } from '@/lib/db/support';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  products?: RecommendedProduct[];
  orderData?: SupportOrderLookupResult['order'];
  isEscalated?: boolean;
  isStreaming?: boolean;
}

interface AssistantMessageItemProps {
  message: ChatMessage;
  supportTicketId: string | null;
  onNavigateProduct: () => void;
}

export function AssistantMessageItem({
  message,
  supportTicketId,
  onNavigateProduct,
}: AssistantMessageItemProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[90%] p-3.5 text-xs leading-relaxed rounded-md ${
          isUser
            ? 'bg-accent-brass/15 border border-accent-brass/30 text-text-ondark'
            : 'bg-bg-primary/60 border border-hairline text-text-ondark/90'
        }`}
      >
        {/* Escalation Banner */}
        {message.isEscalated && (
          <div className="mb-2 p-2 bg-rose-950/30 border border-rose-500/40 text-rose-300 text-[11px] flex items-center gap-1.5 rounded-md">
            <AlertTriangle size={13} className="shrink-0" />
            <span>Ticket #{supportTicketId?.slice(-6).toUpperCase()} Escalated to Senior Concierge</span>
          </div>
        )}

        <p className="whitespace-pre-wrap font-light">
          {message.content}
          {message.isStreaming && (
            <span className="inline-block w-1.5 h-3 ml-1 bg-accent-brass animate-pulse align-middle" />
          )}
        </p>

        {/* Order Lookup Card */}
        {message.orderData && (
          <div className="mt-3 p-3 bg-bg-deep border border-accent-brass/30 space-y-2 rounded-md">
            <div className="flex items-center justify-between border-b border-hairline pb-2">
              <div className="flex items-center gap-1.5 text-accent-brass font-medium">
                <Package size={13} />
                <span>Order #{message.orderData.orderNumber}</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">
                {message.orderData.status}
              </span>
            </div>
            <div className="text-[11px] text-text-ondark/70 space-y-1">
              <p>Carrier: {message.orderData.shippingCarrier} · Tracking: {message.orderData.trackingNumber}</p>
              <p>Total: {brandConfig.currency.symbol}{message.orderData.total.toLocaleString()}</p>
            </div>
            {message.orderData.items && message.orderData.items.length > 0 && (
              <div className="pt-1 space-y-1">
                {message.orderData.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[10px] text-text-ondark/60">
                    <span>{it.quantity}x {it.productName} ({it.size || 'OS'})</span>
                    <span>{brandConfig.currency.symbol}{it.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inline Product Cards */}
        {message.products && message.products.length > 0 && (
          <div className="mt-3 space-y-2 border-t border-hairline pt-3">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-accent-brass font-medium">
              <ShoppingBag size={11} />
              Recommended Pieces ({message.products.length})
            </div>
            <div className="space-y-2">
              {message.products.map((prod) => (
                <AssistantProductCard
                  key={prod.id}
                  product={prod}
                  onNavigate={onNavigateProduct}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
