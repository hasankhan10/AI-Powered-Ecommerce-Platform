'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Tag, Check, X, Sparkles, AlertCircle } from 'lucide-react';
import { content } from '@/config/content';

interface CartItem {
  id: string;
  productName: string;
  size?: string | null;
  imageUrl: string;
  quantity: number;
  price: number;
}

export interface AppliedOffer {
  code: string;
  discountPercent: number;
  discountAmount: number;
  title: string;
}

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  grandTotal: number;
  appliedOffer?: AppliedOffer | null;
  onApplyOffer?: (code: string) => Promise<boolean>;
  onRemoveOffer?: () => void;
  isApplyingOffer?: boolean;
}

export function CheckoutOrderSummary({
  items,
  subtotal,
  shippingFee,
  grandTotal,
  appliedOffer,
  onApplyOffer,
  onRemoveOffer,
  isApplyingOffer = false,
}: CheckoutOrderSummaryProps) {
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim() || !onApplyOffer) return;
    setPromoError(null);
    const success = await onApplyOffer(promoInput.trim());
    if (success) {
      setPromoInput('');
    }
  };

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

        {/* Promo / Offer Code Box */}
        {onApplyOffer && (
          <div className="pt-4 border-t border-hairline space-y-2">
            <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70 font-medium">
              Have an Offer or Promo Code?
            </label>

            {appliedOffer ? (
              <div className="flex items-center justify-between p-3 bg-accent-brass/10 border border-accent-brass/30 rounded-md">
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-accent-brass shrink-0" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-accent-brass">
                        {appliedOffer.code}
                      </span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-500/30">
                        {appliedOffer.discountPercent}% OFF
                      </span>
                    </div>
                    <p className="text-[10px] text-text-ondark/60 font-light">
                      Saved ₹{appliedOffer.discountAmount.toLocaleString('en-IN')} on your order
                    </p>
                  </div>
                </div>
                {onRemoveOffer && (
                  <button
                    type="button"
                    onClick={onRemoveOffer}
                    className="text-text-ondark/40 hover:text-rose-400 transition-colors p-1"
                    title="Remove coupon"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            ) : (
              <form onSubmit={handleApply} className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => {
                    setPromoInput(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''));
                    setPromoError(null);
                  }}
                  placeholder="e.g. WELCOME10, MAISON20"
                  className="flex-1 bg-bg-primary border border-hairline px-3 py-2 text-xs font-mono uppercase text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none rounded-sm"
                />
                <button
                  type="submit"
                  disabled={isApplyingOffer || !promoInput.trim()}
                  className="px-4 py-2 bg-accent-brass text-bg-deep text-xs font-medium uppercase tracking-wider hover:bg-accent-brass-hover transition-colors disabled:opacity-40 rounded-sm shrink-0"
                >
                  {isApplyingOffer ? 'Applying...' : 'Apply'}
                </button>
              </form>
            )}

            {promoError && (
              <p className="text-[10px] text-rose-400 flex items-center gap-1">
                <AlertCircle size={11} />
                <span>{promoError}</span>
              </p>
            )}
          </div>
        )}

        {/* Price Breakdown */}
        <div className="space-y-2.5 pt-4 border-t border-hairline text-xs font-light">
          <div className="flex justify-between text-text-ondark/70">
            <span>Subtotal</span>
            <span className="font-mono">
              ₹{subtotal.toLocaleString('en-IN')}
            </span>
          </div>

          {appliedOffer && appliedOffer.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-400 font-medium">
              <span className="flex items-center gap-1">
                <span>Discount ({appliedOffer.code})</span>
                <span className="text-[10px] text-emerald-400/70 font-mono">({appliedOffer.discountPercent}%)</span>
              </span>
              <span className="font-mono">
                -₹{appliedOffer.discountAmount.toLocaleString('en-IN')}
              </span>
            </div>
          )}

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
