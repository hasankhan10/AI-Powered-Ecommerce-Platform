'use client';

import React from 'react';
import Link from 'next/link';
import { Package, ShoppingBag } from 'lucide-react';
import { content } from '@/config/content';

export interface OrderItem {
  id: string;
  productName: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  total: number;
  itemsCount: number;
  items?: OrderItem[];
}

interface AccountOrdersTabProps {
  orders: OrderSummary[];
  loading: boolean;
}

export function AccountOrdersTab({ orders, loading }: AccountOrdersTabProps) {
  return (
    <div className="border border-hairline bg-bg-deep p-6 sm:p-8 rounded-lg space-y-6">
      <div className="flex items-center justify-between border-b border-hairline/60 pb-4">
        <div>
          <h3 className="font-serif text-xl text-text-ondark font-light">
            {content.account.ordersLabel}
          </h3>
          <p className="text-xs text-text-ondark/60 font-light mt-0.5">
            Track past formulation acquisitions and delivery updates.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-text-ondark/50">
          Loading your orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="py-16 text-center space-y-4">
          <div className="h-12 w-12 mx-auto rounded-full bg-bg-primary border border-hairline flex items-center justify-center text-accent-brass/60">
            <Package size={22} />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h4 className="font-serif text-lg text-text-ondark font-light">
              {content.account.noOrders}
            </h4>
            <p className="text-xs text-text-ondark/60 font-light">
              When you acquire pieces from our collections, your order tracking and receipts will appear here.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-accent-brass px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-medium text-bg-primary hover:bg-accent-brass-hover transition-colors rounded-md shadow-sm mt-2"
          >
            <ShoppingBag size={14} />
            <span>Discover the Collection</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="border border-hairline bg-bg-primary p-5 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-text-ondark font-medium">
                    #{ord.orderNumber}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-accent-brass/10 text-accent-brass border border-accent-brass/30">
                    {ord.status}
                  </span>
                </div>
                <p className="text-xs text-text-ondark/60 font-light">
                  {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                {ord.items && ord.items.length > 0 && (
                  <p className="text-[11px] text-text-ondark/50">
                    {ord.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="font-serif text-base text-text-ondark">
                  ₹{ord.total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
