'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RotateCcw, Copy, Check } from 'lucide-react';

interface OrderHeroConfirmationProps {
  orderNumber: string;
  isCOD: boolean;
  copied: boolean;
  onCopyOrderNumber: () => void;
  onCelebrate: () => void;
}

export function OrderHeroConfirmation({
  orderNumber,
  isCOD,
  copied,
  onCopyOrderNumber,
  onCelebrate,
}: OrderHeroConfirmationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="text-center space-y-5 border-b border-hairline pb-12 relative z-10"
    >
      <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
        {/* Pulsing Ambient Radiance */}
        <div className="absolute inset-0 rounded-full bg-accent-brass/25 blur-2xl animate-pulse" />

        {/* Outer Decorative Spinning Seal */}
        <div
          className="absolute -inset-2.5 rounded-full border border-dashed border-accent-brass/40 animate-spin"
          style={{ animationDuration: '24s' }}
        />
        <div
          className="absolute -inset-1 rounded-full border border-accent-brass/30 animate-spin"
          style={{ animationDuration: '14s', animationDirection: 'reverse' }}
        />

        {/* Central Luxury Gold Crest Badge */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: 0.15,
          }}
          className="relative flex h-22 w-22 items-center justify-center rounded-full border-2 border-accent-brass bg-gradient-to-br from-bg-primary via-bg-deep to-[#1b1713] shadow-2xl shadow-accent-brass/30"
        >
          <svg
            className="h-11 w-11 text-accent-brass drop-shadow-md"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>
      </div>

      <div className="space-y-2.5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-brass/10 border border-accent-brass/30 text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium shadow-sm">
          <Sparkles size={11} className="animate-pulse" />
          <span>{isCOD ? 'Order Placed — Cash on Delivery' : 'Payment Confirmed & Verified'}</span>
        </div>

        <h1 className="font-serif text-3xl sm:text-5xl font-light text-text-ondark tracking-tight">
          Thank You For Your Order
        </h1>

        <p className="text-xs sm:text-sm text-text-ondark/70 font-light max-w-lg mx-auto leading-relaxed">
          {isCOD
            ? 'Your bespoke order has been recorded. Our ateliers are now preparing your pieces. Please keep exact cash ready upon delivery.'
            : 'Your transaction was completed securely. Our ateliers are currently preparing your pieces for express courier delivery.'}
        </p>
      </div>

      {/* Order Reference Pill with Copy and Re-celebrate Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-lg bg-bg-deep border border-hairline shadow-inner">
          <span className="text-[10px] uppercase tracking-wider text-text-ondark/50">Reference:</span>
          <span className="font-mono text-sm font-semibold text-accent-brass tracking-wider">
            {orderNumber}
          </span>
          <button
            type="button"
            onClick={onCopyOrderNumber}
            className="p-1 hover:text-accent-brass text-text-ondark/40 transition-colors cursor-pointer"
            title="Copy Order Number"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
        </div>

        <button
          type="button"
          onClick={onCelebrate}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-bg-deep/70 border border-hairline/70 hover:border-accent-brass text-text-ondark/60 hover:text-accent-brass text-xs transition-colors cursor-pointer"
          title="Replay Celebration"
        >
          <RotateCcw size={12} />
          <span className="text-[10px] uppercase tracking-wider">Celebrate</span>
        </button>
      </div>
    </motion.div>
  );
}
