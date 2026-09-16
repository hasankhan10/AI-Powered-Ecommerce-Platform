'use client';

import React from 'react';
import { Users, UserCheck, RefreshCw, DollarSign } from 'lucide-react';
import { CustomerSegmentsData } from '@/lib/db/analytics';

interface CustomerSegmentsCardProps {
  segments: CustomerSegmentsData;
}

export function CustomerSegmentsCard({ segments }: CustomerSegmentsCardProps) {
  const totalPaying = segments.newCustomers + segments.returningCustomers;
  const newShare = totalPaying > 0 ? Math.round((segments.newCustomers / totalPaying) * 100) : 0;
  const returningShare = totalPaying > 0 ? 100 - newShare : 0;

  const totalCustomerRev = segments.newCustomerRevenue + segments.returningCustomerRevenue;
  const newRevShare =
    totalCustomerRev > 0 ? Math.round((segments.newCustomerRevenue / totalCustomerRev) * 100) : 0;
  const retRevShare = totalCustomerRev > 0 ? 100 - newRevShare : 0;

  return (
    <div className="border border-hairline bg-bg-deep p-4 sm:p-6 space-y-4 sm:space-y-6 rounded-md shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-hairline pb-4 gap-2">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium block">
            Audience Intelligence
          </span>
          <h3 className="font-serif text-lg sm:text-xl font-light text-text-ondark mt-0.5">
            Customer Segments & Retention
          </h3>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 border border-hairline text-[11px] text-text-ondark/60 font-mono self-start sm:self-auto">
          <Users size={12} className="text-accent-brass" />
          <span>{segments.totalCustomers} Registered Customers</span>
        </div>
      </div>

      {totalPaying === 0 ? (
        <div className="py-10 text-center space-y-2">
          <UserCheck size={28} className="text-accent-brass/40 mx-auto" />
          <p className="text-xs text-text-ondark/60 font-light">No customer purchases recorded yet.</p>
          <p className="text-[10px] text-text-ondark/40">
            Customer retention segments will compute automatically upon checkout.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Repeat Purchase Rate Metric */}
          <div className="p-4 border border-accent-brass/30 bg-accent-brass/5 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase tracking-wider text-accent-brass font-medium block">
                Repeat Purchase Rate
              </span>
              <p className="text-xs text-text-ondark/70 font-light">
                Percentage of customers with more than 1 completed order.
              </p>
            </div>
            <div className="text-right">
              <span className="font-serif text-2xl font-light text-accent-brass">
                {segments.repeatPurchaseRate}%
              </span>
            </div>
          </div>

          {/* Volume Breakdown */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-ondark/60 uppercase tracking-wider text-[10px]">
                Buyer Volume Distribution
              </span>
              <span className="font-mono text-text-ondark/40 text-[10px]">
                {totalPaying} Paying Buyers
              </span>
            </div>

            {/* Split Bar */}
            <div className="w-full h-2.5 bg-bg-primary flex overflow-hidden border border-hairline">
              <div
                className="h-full bg-accent-brass transition-all duration-500"
                style={{ width: `${newShare}%` }}
                title={`New: ${newShare}%`}
              />
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${returningShare}%` }}
                title={`Returning: ${returningShare}%`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="border border-hairline p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-text-ondark/60">
                  <span className="w-2 h-2 rounded-full bg-accent-brass" />
                  First-Time Buyers
                </div>
                <div className="font-serif text-base text-text-ondark">
                  {segments.newCustomers} ({newShare}%)
                </div>
              </div>

              <div className="border border-hairline p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-text-ondark/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Returning Clients
                </div>
                <div className="font-serif text-base text-text-ondark">
                  {segments.returningCustomers} ({returningShare}%)
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Contribution */}
          <div className="space-y-3 pt-2 border-t border-hairline/60">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-ondark/60 uppercase tracking-wider text-[10px]">
                Revenue by Customer Segment
              </span>
              <span className="font-mono text-text-ondark/40 text-[10px]">
                ₹{totalCustomerRev.toLocaleString('en-IN')} Total
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border border-hairline bg-bg-primary/30 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-text-ondark/40 block">
                  New Buyer Revenue
                </span>
                <span className="font-serif text-base text-text-ondark">
                  ₹{segments.newCustomerRevenue.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-text-ondark/50 block font-mono">
                  {newRevShare}% of total
                </span>
              </div>

              <div className="p-3 border border-hairline bg-bg-primary/30 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-text-ondark/40 block">
                  Returning Revenue
                </span>
                <span className="font-serif text-base text-text-ondark">
                  ₹{segments.returningCustomerRevenue.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-emerald-400 block font-mono">
                  {retRevShare}% of total
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
