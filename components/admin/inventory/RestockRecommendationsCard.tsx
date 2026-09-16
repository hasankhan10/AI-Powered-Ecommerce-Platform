'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AlertTriangle,
  RefreshCw,
  TrendingDown,
  Check,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { RestockRecommendation } from '@/lib/db/inventory';

interface RestockRecommendationsCardProps {
  initialRecommendations: RestockRecommendation[];
}

export function RestockRecommendationsCard({
  initialRecommendations,
}: RestockRecommendationsCardProps) {
  const [recommendations, setRecommendations] =
    useState<RestockRecommendation[]>(initialRecommendations);
  const [restockingId, setRestockingId] = useState<string | null>(null);
  const [restockedIds, setRestockedIds] = useState<Set<string>>(new Set());

  const handleQuickRestock = async (item: RestockRecommendation) => {
    setRestockingId(item.variantId);
    try {
      const res = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: item.variantId,
          delta: item.suggestedReorderQty,
          reason: 'RESTOCK',
        }),
      });

      if (!res.ok) {
        throw new Error('Restock request failed');
      }

      setRestockedIds((prev) => new Set(prev).add(item.variantId));

      // Update local state
      setRecommendations((prev) =>
        prev.map((r) =>
          r.variantId === item.variantId
            ? {
                ...r,
                currentStock: r.currentStock + item.suggestedReorderQty,
                urgency: 'MODERATE',
                daysUntilStockout:
                  r.dailyVelocity > 0
                    ? Math.round((r.currentStock + item.suggestedReorderQty) / r.dailyVelocity)
                    : null,
              }
            : r
        )
      );
    } catch (err: any) {
      alert(err.message || 'Error updating stock');
    } finally {
      setRestockingId(null);
    }
  };

  const criticalCount = recommendations.filter((r) => r.urgency === 'CRITICAL').length;

  return (
    <div className="border border-hairline bg-bg-deep p-4 sm:p-6 space-y-4 sm:space-y-6 rounded-md shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-hairline pb-4 gap-2">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium flex items-center gap-1.5">
            <AlertTriangle size={12} className="text-amber-400" />
            Predictive Replenishment
          </span>
          <h3 className="font-serif text-xl font-light text-text-ondark mt-0.5">
            Restock Recommendations ({recommendations.length})
          </h3>
        </div>

        {criticalCount > 0 && (
          <span className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-mono uppercase tracking-wider">
            {criticalCount} Critical Stockouts
          </span>
        )}
      </div>

      {recommendations.length === 0 ? (
        <div className="p-8 border border-hairline bg-bg-primary/20 text-center space-y-2">
          <Check size={28} className="text-emerald-400 mx-auto" />
          <p className="text-xs text-text-ondark/70 font-light">
            All catalogue variants maintain optimal buffer inventory.
          </p>
          <p className="text-[10px] text-text-ondark/40">
            No variants are currently at risk of stockout within the next 14 days.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.slice(0, 5).map((item) => {
            const isRestocked = restockedIds.has(item.variantId);
            const isRestocking = restockingId === item.variantId;

            return (
              <div
                key={item.variantId}
                className="p-4 border border-hairline bg-bg-primary/30 hover:border-hairline/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Product & Variant info */}
                <div className="flex items-center gap-3.5">
                  <div className="relative w-12 h-14 bg-bg-primary overflow-hidden border border-hairline shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-text-ondark/30">
                        MV
                      </div>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/product/${item.productSlug}`}
                        className="text-xs font-serif font-light text-text-ondark hover:text-accent-brass transition-colors"
                      >
                        {item.productName}
                      </Link>
                      <span
                        className={`text-[9px] uppercase px-1.5 py-0.2 font-mono border ${
                          item.urgency === 'CRITICAL'
                            ? 'border-rose-500/40 text-rose-400 bg-rose-500/10'
                            : item.urgency === 'HIGH'
                            ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                            : 'border-hairline text-text-ondark/60'
                        }`}
                      >
                        {item.urgency}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-text-ondark/50">
                      <span>Variant: {item.variantLabel}</span>
                      <span>•</span>
                      <span className="font-mono text-[10px]">SKU: {item.sku}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] pt-0.5">
                      <span className="text-rose-400 font-mono">
                        Stock: {item.currentStock} units
                      </span>
                      {item.daysUntilStockout !== null && (
                        <span className="text-text-ondark/50">
                          ~{item.daysUntilStockout} days until stockout
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reorder Action */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] uppercase tracking-wider text-text-ondark/40 block">
                      Suggested Reorder
                    </span>
                    <span className="font-mono text-xs text-accent-brass font-medium">
                      +{item.suggestedReorderQty} units
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isRestocking || isRestocked}
                    onClick={() => handleQuickRestock(item)}
                    className={`px-3.5 py-2 text-[10px] uppercase tracking-wider font-medium transition-colors flex items-center gap-1.5 border ${
                      isRestocked
                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 cursor-default'
                        : isRestocking
                        ? 'border-accent-brass text-accent-brass opacity-60'
                        : 'border-accent-brass bg-accent-brass/10 hover:bg-accent-brass hover:text-bg-primary text-accent-brass'
                    }`}
                  >
                    {isRestocked ? (
                      <>
                        <Check size={12} />
                        <span>Restocked</span>
                      </>
                    ) : isRestocking ? (
                      <>
                        <RefreshCw size={12} className="animate-spin" />
                        <span>Adjusting...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={12} />
                        <span>Quick Restock (+{item.suggestedReorderQty})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
