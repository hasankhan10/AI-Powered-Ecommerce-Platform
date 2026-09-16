'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Truck } from 'lucide-react';

interface OrderDeliveryTimelineProps {
  isCOD: boolean;
}

export function OrderDeliveryTimeline({ isCOD }: OrderDeliveryTimelineProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="border border-hairline bg-bg-deep p-6 sm:p-8 rounded-lg space-y-6 shadow-sm"
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
  );
}
