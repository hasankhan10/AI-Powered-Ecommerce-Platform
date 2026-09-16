'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { Printer, ShoppingBag, User } from 'lucide-react';
import { content } from '@/config/content';
import { OrderHeroConfirmation } from './OrderHeroConfirmation';
import { OrderDeliveryTimeline } from './OrderDeliveryTimeline';
import {
  OrderConfirmedDetailsCard,
  OrderItemDisplay,
  OrderAddressDisplay,
} from './OrderConfirmedDetailsCard';

export type { OrderItemDisplay, OrderAddressDisplay };

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
      <OrderHeroConfirmation
        orderNumber={orderNumber}
        isCOD={isCOD}
        copied={copied}
        onCopyOrderNumber={handleCopyOrderNumber}
        onCelebrate={fireLuxuryCelebration}
      />

      {/* Interactive Delivery Timeline Tracker */}
      <OrderDeliveryTimeline isCOD={isCOD} />

      {/* Main Order Details Card */}
      <OrderConfirmedDetailsCard
        orderItems={orderItems}
        address={address}
        total={total}
        isCOD={isCOD}
      />

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
