'use client';

import React from 'react';
import { CreditCard, Banknote, Check, Truck, Lock, ShieldCheck } from 'lucide-react';
import { content } from '@/config/content';

interface CheckoutPaymentSectionProps {
  paymentMethod: 'ONLINE' | 'COD';
  loading: boolean;
  grandTotal: number;
  onPaymentMethodChange: (method: 'ONLINE' | 'COD') => void;
}

export function CheckoutPaymentSection({
  paymentMethod,
  loading,
  grandTotal,
  onPaymentMethodChange,
}: CheckoutPaymentSectionProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-hairline">
      <div>
        <span className="text-[10px] uppercase tracking-[0.3em] text-accent-brass font-medium">
          Step 2 of 2
        </span>
        <h3 className="font-serif text-xl font-light text-text-ondark mt-0.5">
          Payment Method
        </h3>
        <p className="text-xs text-text-ondark/60 font-light mt-0.5">
          Select your preferred transaction method.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Option 1: Online Payment */}
        <div
          onClick={() => onPaymentMethodChange('ONLINE')}
          className={`p-4 rounded-lg border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
            paymentMethod === 'ONLINE'
              ? 'border-accent-brass bg-accent-brass/10 ring-1 ring-accent-brass shadow-sm'
              : 'border-hairline bg-bg-deep/70 hover:border-text-ondark/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CreditCard size={18} className="text-accent-brass" />
              <span className="text-xs font-medium text-text-ondark">
                Online Payment
              </span>
            </div>
            {paymentMethod === 'ONLINE' && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent-brass text-bg-primary">
                <Check size={11} strokeWidth={3} />
              </span>
            )}
          </div>
          <p className="text-[11px] text-text-ondark/60 leading-relaxed font-light">
            Cards (Visa, Mastercard, RuPay), UPI, NetBanking & Wallets.
          </p>
          <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-mono">
            ● Instant Online Verification
          </span>
        </div>

        {/* Option 2: Cash on Delivery (COD) */}
        <div
          onClick={() => onPaymentMethodChange('COD')}
          className={`p-4 rounded-lg border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
            paymentMethod === 'COD'
              ? 'border-accent-brass bg-accent-brass/10 ring-1 ring-accent-brass shadow-sm'
              : 'border-hairline bg-bg-deep/70 hover:border-text-ondark/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Banknote size={18} className="text-accent-brass" />
              <span className="text-xs font-medium text-text-ondark">
                Cash on Delivery (COD)
              </span>
            </div>
            {paymentMethod === 'COD' && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent-brass text-bg-primary">
                <Check size={11} strokeWidth={3} />
              </span>
            )}
          </div>
          <p className="text-[11px] text-text-ondark/60 leading-relaxed font-light">
            Pay with cash upon physical delivery at your doorstep.
          </p>
          <span className="text-[9px] uppercase tracking-wider text-accent-brass font-mono">
            ● Pay on Delivery
          </span>
        </div>
      </div>

      {/* Payment Action Button */}
      <div className="pt-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent-brass py-4 text-xs uppercase tracking-[0.25em] font-medium text-bg-primary hover:bg-accent-brass-hover transition-colors flex items-center justify-center gap-3 disabled:opacity-50 rounded-md shadow-md cursor-pointer"
        >
          {paymentMethod === 'COD' ? <Truck size={15} /> : <Lock size={14} />}
          {loading
            ? paymentMethod === 'COD'
              ? 'Placing Cash on Delivery Order...'
              : 'Connecting to Secured Gateway...'
            : paymentMethod === 'COD'
            ? `Place Cash on Delivery Order (₹${grandTotal.toLocaleString('en-IN')})`
            : `${content.checkout.payNow} (₹${grandTotal.toLocaleString('en-IN')})`}
        </button>
        <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-text-ondark/50">
          <ShieldCheck size={14} className="text-accent-brass" />
          <span>
            {paymentMethod === 'COD'
              ? 'No advance payment needed — Pay upon courier receipt'
              : `${content.checkout.securePayment} — 256-bit encrypted`}
          </span>
        </div>
      </div>
    </div>
  );
}
