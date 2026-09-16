'use client';

import React from 'react';
import { SupportQueueData } from '@/lib/db/support';

interface SupportMetricsOverviewProps {
  metrics: SupportQueueData['metrics'];
}

export function SupportMetricsOverview({ metrics }: SupportMetricsOverviewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div className="border border-hairline bg-bg-deep p-4 sm:p-5 space-y-1 rounded-md shadow-sm">
        <span className="text-[10px] uppercase tracking-widest text-text-ondark/50 block">
          Total Tickets
        </span>
        <span className="font-serif text-2xl font-light text-text-ondark">
          {metrics.totalTickets}
        </span>
      </div>

      <div className="border border-hairline bg-bg-deep p-4 sm:p-5 space-y-1 rounded-md shadow-sm">
        <span className="text-[10px] uppercase tracking-widest text-amber-400/80 block">
          Open Inquiries
        </span>
        <span className="font-serif text-2xl font-light text-amber-400">
          {metrics.openTickets}
        </span>
      </div>

      <div className="border border-hairline bg-bg-deep p-4 sm:p-5 space-y-1 rounded-md shadow-sm">
        <span className="text-[10px] uppercase tracking-widest text-rose-400/80 block">
          Escalated to Human
        </span>
        <span className="font-serif text-2xl font-light text-rose-400">
          {metrics.escalatedTickets}
        </span>
      </div>

      <div className="border border-hairline bg-bg-deep p-4 sm:p-5 space-y-1 rounded-md shadow-sm">
        <span className="text-[10px] uppercase tracking-widest text-emerald-400/80 block">
          Avg Resolution Time
        </span>
        <span className="font-serif text-2xl font-light text-emerald-400">
          {metrics.avgResolutionTimeMinutes}m
        </span>
      </div>
    </div>
  );
}
