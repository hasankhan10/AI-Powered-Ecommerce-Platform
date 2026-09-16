'use client';

import React from 'react';
import Image from 'next/image';
import { content } from '@/config/content';

interface CartItem {
  id: string;
  productName: string;
  size?: string | null;
  imageUrl: string;
  quantity: number;
  price: number;
}

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  grandTotal: number;
}

export function CheckoutOrderSummary({
  items,
  subtotal,
  shippingFee,
  grandTotal,
}: CheckoutOrderSummaryProps) {
  return (
    <div className="lg:col-span-5">
      <div className="sticky top-28 border border-hairline bg-bg-deep/80 backdrop-blur-md p-6 lg:p-8 space-y-6 rounded-lg">
        <h2 className="font-serif text-xl font-light text-text-ondark border-b border-hairline pb-4">
          {content.checkout.orderSummaryTitle}
        </h2>

        {/* Items List */}
        <div className="divide-y divide-hairline space-y-4 max-h-72 overflow-y-auto pr-2">
          {items.map((item) => (
            <div key={item.id} className="pt-4 first:pt-0 flex gap-4 items-center">
              <div className="relative h-16 w-14 shrink-0 border border-hairline bg-bg-primary overflow-hidden rounded-md">
                <Image
                  src={item.imageUrl}
                  alt={item.productName}
                  fill
                  sizes="60px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-serif text-xs font-light text-text-ondark truncate">
                  {item.productName}
                </h4>
                <p className="text-[10px] text-text-ondark/50 font-light">
                  Qty: {item.quantity} {item.size ? `• Size: ${item.size}` : ''}
                </p>
              </div>
              <span className="text-xs font-serif font-light text-text-ondark">
                ₹{(item.price * item.quantity).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2.5 pt-4 border-t border-hairline text-xs font-light">
          <div className="flex justify-between text-text-ondark/70">
            <span>Subtotal</span>
            <span className="font-mono">
              ₹{subtotal.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between text-text-ondark/70">
            <span>Shipping</span>
            <span className="font-mono">
              {shippingFee === 0 ? (
                <span className="text-accent-brass font-sans">FREE</span>
              ) : (
                `₹${shippingFee.toLocaleString('en-IN')}`
              )}
            </span>
          </div>
          <div className="flex justify-between text-text-ondark/70">
            <span>Taxes</span>
            <span className="text-text-ondark/40">Included</span>
          </div>
        </div>

        {/* Total */}
        <div className="pt-4 border-t border-hairline flex justify-between items-baseline">
          <span className="text-xs uppercase tracking-[0.2em] font-medium text-text-ondark">
            Total Due
          </span>
          <span className="font-serif text-2xl font-light text-accent-brass">
            ₹{grandTotal.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
}
