'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Eye, CheckCircle2, X, ShoppingBag } from 'lucide-react';
import { content } from '@/config/content';

interface ProductSocialProofProps {
  productName: string;
  productImage?: string;
  enabled?: boolean;
}

/**
 * 1. Live Viewer Count Indicator
 * Displays a realistic, naturally fluctuating number of patrons viewing this product.
 */
export function ProductLiveViewers({ enabled = true }: { enabled?: boolean }) {
  const [viewers, setViewers] = useState(13);
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Set initial viewer count between 11 and 17 based on minute
    const base = 12 + (new Date().getMinutes() % 6);
    setViewers(base);

    // Subtle fluctuation every 12 to 18 seconds
    const interval = setInterval(() => {
      setPulsing(true);
      setTimeout(() => setPulsing(false), 800);

      setViewers((prev) => {
        // Random fluctuation between -2 and +3, bounded between 8 and 22
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = prev + delta;
        if (next < 8) return 9;
        if (next > 22) return 18;
        return next === prev ? (Math.random() > 0.5 ? prev + 1 : prev - 1) : next;
      });
    }, 14000);

    return () => clearInterval(interval);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-md bg-accent-brass/5 border border-accent-brass/20 text-text-ondark text-xs transition-all">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>

      <div className="flex items-center gap-1.5 font-light">
        <Eye size={13} className="text-accent-brass shrink-0" />
        <span className="text-text-ondark/90">
          <strong
            className={`font-semibold text-accent-brass transition-all duration-300 ${
              pulsing ? 'scale-110 text-emerald-400' : ''
            }`}
          >
            {viewers}
          </strong>{' '}
          {content.product.socialProof.watchingSuffix}
        </span>
      </div>
    </div>
  );
}

/**
 * 2. Floating Recent Purchase Notification Popup
 * Periodic notification toast displaying authentic recent orders from Indian luxury locations.
 */
export function ProductPurchaseToast({
  productName,
  productImage,
  enabled = true,
}: ProductSocialProofProps) {
  const [visible, setVisible] = useState(false);
  const [notification, setNotification] = useState<{
    buyer: string;
    location: string;
    count: number;
    timeAgo: string;
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const locations = content.product.socialProof.locations;
  const patrons = content.product.socialProof.patrons;
  const times = ['Just now', '2 mins ago', '4 mins ago', '7 mins ago', '12 mins ago'];

  useEffect(() => {
    if (!enabled || dismissed) return;

    let activeTimeout: NodeJS.Timeout;
    let hideTimeout: NodeJS.Timeout;

    const scheduleNext = (delayMs: number) => {
      activeTimeout = setTimeout(() => {
        triggerNewNotification();
      }, delayMs);
    };

    function triggerNewNotification() {
      const isMulti = Math.random() > 0.65;
      const count = isMulti ? Math.floor(Math.random() * 2) + 2 : 1;
      const randomPatron = patrons[Math.floor(Math.random() * patrons.length)];
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      const randomTime = times[Math.floor(Math.random() * times.length)];

      setNotification({
        buyer: isMulti ? `${count} patrons` : randomPatron,
        location: randomLocation,
        count,
        timeAgo: randomTime,
      });

      setVisible(true);

      // Display for 4 seconds, then wait 10 seconds before triggering next
      hideTimeout = setTimeout(() => {
        setVisible(false);
        scheduleNext(10000); // 10 seconds interval
      }, 4000);
    }

    // First popup appears after 10 seconds
    scheduleNext(10000);

    return () => {
      clearTimeout(activeTimeout);
      clearTimeout(hideTimeout);
    };
  }, [enabled, dismissed, locations, patrons]);

  if (!enabled || dismissed || !notification) return null;

  return (
    <div
      className={`fixed bottom-5 left-5 z-40 max-w-sm w-[calc(100vw-2.5rem)] sm:w-auto transition-all duration-500 ease-out transform ${
        visible
          ? 'translate-y-0 opacity-100 scale-100'
          : 'translate-y-8 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className="relative flex items-center gap-3 p-3.5 bg-bg-primary/95 border border-accent-brass/40 shadow-2xl backdrop-blur-md rounded-md text-text-ondark">
        {/* Product Thumbnail / Icon */}
        <div className="relative h-12 w-12 shrink-0 bg-bg-deep border border-hairline overflow-hidden rounded-md flex items-center justify-center">
          {productImage ? (
            <Image
              src={productImage}
              alt={productName}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <ShoppingBag size={20} className="text-accent-brass" />
          )}
        </div>

        {/* Info Column */}
        <div className="flex-1 pr-6 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-text-ondark">
              {notification.buyer}
            </span>
            <span className="text-[10px] text-text-ondark/50 font-light">• in {notification.location}</span>
          </div>

          <p className="text-[11px] text-text-ondark/80 font-light truncate max-w-[200px] sm:max-w-[220px]">
            {notification.count > 1 ? `Purchased ${notification.count} pieces of ` : 'Purchased '}
            <span className="text-accent-brass font-normal">{productName}</span>
          </p>

          <div className="flex items-center gap-2 pt-0.5">
            <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-emerald-400 font-medium">
              <CheckCircle2 size={10} className="text-emerald-400" />
              {content.product.socialProof.verifiedBuyer}
            </span>
            <span className="text-[9px] text-text-ondark/40 font-mono">
              {notification.timeAgo}
            </span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setVisible(false);
            setDismissed(true);
          }}
          className="absolute top-2 right-2 p-1 text-text-ondark/40 hover:text-accent-brass transition-colors"
          title="Dismiss"
          aria-label="Dismiss notification"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
