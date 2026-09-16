'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  PackageCheck,
  ArrowRight,
  Truck,
  Copy,
  Check,
  Printer,
  Sparkles,
  ShoppingBag,
  User,
  ShieldCheck,
  Banknote,
  CreditCard,
  RotateCcw,
} from 'lucide-react';
import { brandConfig } from '@/config/brand.config';
import { content } from '@/config/content';

interface OrderItemDisplay {
  id: string;
  name: string;
  size?: string | null;
  color?: string | null;
  quantity: number;
  price: number;
  imageUrl: string;
}

interface OrderAddressDisplay {
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  country?: string | null;
}

interface OrderConfirmClientProps {
  orderNumber: string;
  orderId?: string;
  total: number | null;
  subtotal?: number | null;
  shipping?: number | null;
  isCOD: boolean;
  orderItems: OrderItemDisplay[];
  address: OrderAddressDisplay | null;
}

export function OrderConfirmClient({
  orderNumber,
  orderId,
  total,
  subtotal,
  shipping = 0,
  isCOD,
  orderItems,
  address,
}: OrderConfirmClientProps) {
  const [copied, setCopied] = useState(false);

  // Trigger high-end luxury gold & champagne celebratory confetti cascade
  const fireLuxuryCelebration = useCallback(() => {
    // Custom luxury palette: Maison Gold, Warm Brass, Champagne Cream, Deep Bronze, Accent Gold
    const colors = ['#C6A87D', '#DBB98C', '#F3EEE8', '#E5C158', '#9F783E'];

    // 1. Initial Central Burst
    confetti({
      particleCount: 70,
      spread: 75,
      origin: { y: 0.45 },
      colors,
      ticks: 250,
      gravity: 0.9,
      scalar: 1.1,
      shapes: ['circle', 'square'],
      disableForReducedMotion: true,
    });

    // 2. Left and Right Cannon Fireworks
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 60,
        origin: { x: 0.05, y: 0.65 },
        colors,
        ticks: 280,
        gravity: 0.85,
        scalar: 1.15,
        disableForReducedMotion: true,
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 60,
        origin: { x: 0.95, y: 0.65 },
        colors,
        ticks: 280,
        gravity: 0.85,
        scalar: 1.15,
        disableForReducedMotion: true,
      });
    }, 280);

    // 3. Gentle Falling Golden Dusting
    setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 100,
        origin: { y: 0.25 },
        colors: ['#E5C158', '#C6A87D', '#FFFFFF'],
        ticks: 350,
        gravity: 0.6,
        scalar: 0.85,
        disableForReducedMotion: true,
      });
    }, 650);
  }, []);

  useEffect(() => {
    // Fire celebratory animation on mount
    const timer = setTimeout(() => {
      fireLuxuryCelebration();
    }, 150);

    return () => clearTimeout(timer);
  }, [fireLuxuryCelebration]);

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="relative mx-auto max-w-3xl space-y-12 py-6">
      {/* Hero Header & Animated Luxury Checkmark Badge */}
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
              onClick={handleCopyOrderNumber}
              className="p-1 hover:text-accent-brass text-text-ondark/40 transition-colors cursor-pointer"
              title="Copy Order Number"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>

          <button
            type="button"
            onClick={fireLuxuryCelebration}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-bg-deep/70 border border-hairline/70 hover:border-accent-brass text-text-ondark/60 hover:text-accent-brass text-xs transition-colors cursor-pointer"
            title="Replay Celebration"
          >
            <RotateCcw size={12} />
            <span className="text-[10px] uppercase tracking-wider">Celebrate</span>
          </button>
        </div>
      </motion.div>

      {/* Interactive Delivery Timeline Tracker */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="border border-hairline bg-bg-deep p-6 sm:p-8 rounded-lg space-y-6"
      >
        <div className="flex items-center justify-between border-b border-hairline/60 pb-4">
          <span className="text-xs uppercase tracking-[0.2em] text-accent-brass font-medium flex items-center gap-2">
            <Truck size={15} /> Delivery Journey
          </span>
          <span className="text-[10px] font-mono text-emerald-400">
            Estimated 3–5 Business Days
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          <div className="space-y-1.5 border-l-2 sm:border-l-0 sm:border-t-2 border-accent-brass pl-3 sm:pl-0 sm:pt-3">
            <span className="text-[9px] uppercase tracking-wider text-accent-brass font-medium">Step 1</span>
            <h4 className="text-xs font-serif text-text-ondark font-normal">Order Confirmed</h4>
            <p className="text-[10px] text-text-ondark/50 font-light">Recorded in atelier system</p>
          </div>

          <div className="space-y-1.5 border-l-2 sm:border-l-0 sm:border-t-2 border-accent-brass/60 pl-3 sm:pl-0 sm:pt-3">
            <span className="text-[9px] uppercase tracking-wider text-accent-brass/80 font-medium">Step 2</span>
            <h4 className="text-xs font-serif text-text-ondark font-normal">Quality Inspection</h4>
            <p className="text-[10px] text-text-ondark/50 font-light">Craftsmanship review</p>
          </div>

          <div className="space-y-1.5 border-l-2 sm:border-l-0 sm:border-t-2 border-hairline pl-3 sm:pl-0 sm:pt-3">
            <span className="text-[9px] uppercase tracking-wider text-text-ondark/40 font-medium">Step 3</span>
            <h4 className="text-xs font-serif text-text-ondark/60 font-normal">Express Courier</h4>
            <p className="text-[10px] text-text-ondark/40 font-light">Dispatched with tracking</p>
          </div>

          <div className="space-y-1.5 border-l-2 sm:border-l-0 sm:border-t-2 border-hairline pl-3 sm:pl-0 sm:pt-3">
            <span className="text-[9px] uppercase tracking-wider text-text-ondark/40 font-medium">Step 4</span>
            <h4 className="text-xs font-serif text-text-ondark/60 font-normal">Doorstep Arrival</h4>
            <p className="text-[10px] text-text-ondark/40 font-light">
              {isCOD ? 'Pay cash on receipt' : 'Handed over securely'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Order Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="border border-hairline bg-bg-deep p-6 sm:p-8 rounded-lg space-y-8"
      >
        {/* Ordered Pieces */}
        {orderItems.length > 0 && (
          <div className="space-y-4 border-b border-hairline/60 pb-6">
            <h3 className="text-xs uppercase tracking-[0.2em] text-text-ondark font-medium">
              Acquired Pieces ({orderItems.reduce((acc, i) => acc + i.quantity, 0)})
            </h3>
            <div className="divide-y divide-hairline">
              {orderItems.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 flex gap-4 items-center">
                  <div className="relative h-16 w-14 shrink-0 border border-hairline bg-bg-primary overflow-hidden rounded-md">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="60px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-sm font-light text-text-ondark truncate">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-text-ondark/50 font-light">
                      Qty: {item.quantity} {item.size ? `• Size: ${item.size}` : ''}{' '}
                      {item.color ? `• Color: ${item.color}` : ''}
                    </p>
                  </div>
                  <span className="text-xs font-serif font-light text-text-ondark">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shipping Destination & Payment Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs font-light">
          {address ? (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider text-accent-brass font-medium block">
                Shipping Destination
              </span>
              <p className="text-text-ondark/90 font-medium">{address.line1}</p>
              {address.line2 && <p className="text-text-ondark/70">{address.line2}</p>}
              <p className="text-text-ondark/70">
                {address.city}, {address.state} — {address.pincode}
              </p>
              <p className="text-text-ondark/50 text-[10px]">{address.country || 'India'}</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase tracking-wider text-accent-brass font-medium block">
                Shipping Destination
              </span>
              <p className="text-text-ondark/70">Standard Domestic Express</p>
            </div>
          )}

          {total !== null && (
            <div className="space-y-2 sm:text-right">
              <span className="text-[10px] uppercase tracking-wider text-text-ondark/40 block">
                {isCOD ? 'Amount Payable On Delivery' : 'Total Amount Paid'}
              </span>
              <p className="font-serif text-3xl font-light text-accent-brass">
                ₹{total.toLocaleString('en-IN')}
              </p>
              <div className="inline-flex items-center gap-1.5 text-[10px] text-text-ondark/60 sm:justify-end">
                {isCOD ? (
                  <>
                    <Banknote size={13} className="text-accent-brass" />
                    <span>Cash on Delivery (Courier Collection)</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={13} className="text-emerald-400" />
                    <span>Paid via 256-bit Secured Gateway</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Action CTA Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
      >
        <Link
          href="/shop"
          className="w-full sm:w-auto px-8 py-3.5 bg-accent-brass text-bg-primary text-xs uppercase tracking-[0.2em] font-medium hover:bg-accent-brass-hover transition-colors rounded-md shadow-md inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <ShoppingBag size={14} />
          <span>{content.cart.continueShopping}</span>
        </Link>

        <Link
          href="/account"
          className="w-full sm:w-auto px-6 py-3.5 border border-hairline text-text-ondark/80 hover:text-accent-brass hover:border-accent-brass/50 text-xs uppercase tracking-wider transition-colors rounded-md inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <User size={14} />
          <span>View In Account</span>
        </Link>

        <button
          type="button"
          onClick={handlePrint}
          className="w-full sm:w-auto px-5 py-3.5 border border-hairline text-text-ondark/50 hover:text-text-ondark text-xs uppercase tracking-wider transition-colors rounded-md inline-flex items-center justify-center gap-2 cursor-pointer"
        >
          <Printer size={14} />
          <span>Print Receipt</span>
        </button>
      </motion.div>
    </div>
  );
}
