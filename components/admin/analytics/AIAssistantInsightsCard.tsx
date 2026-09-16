'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  HelpCircle,
  ArrowUpRight,
} from 'lucide-react';
import {
  OutOfStockDemandItem,
  QuestionTheme,
} from '@/lib/db/analytics';

interface AIAssistantInsightsCardProps {
  outOfStockDemand: OutOfStockDemandItem[];
  questionThemes: QuestionTheme[];
  aiConversionRate: number;
  organicConversionRate: number;
  totalInquiries: number;
}

export function AIAssistantInsightsCard({
  outOfStockDemand,
  questionThemes,
  aiConversionRate,
  organicConversionRate,
  totalInquiries,
}: AIAssistantInsightsCardProps) {
  const activeThemes = questionThemes.filter((t) => t.count > 0);

  return (
    <div className="border border-hairline bg-bg-deep p-4 sm:p-6 space-y-4 sm:space-y-6 rounded-md shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-hairline pb-4 gap-2">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium flex items-center gap-1.5">
            <Sparkles size={12} />
            AI Stylist Telemetry
          </span>
          <h3 className="font-serif text-lg sm:text-xl font-light text-text-ondark mt-0.5">
            Conversational Insights & Conversion
          </h3>
        </div>

        <div className="text-[11px] text-text-ondark/50 font-light">
          {totalInquiries} user inquiries analyzed
        </div>
      </div>

      {/* AI Assisted vs Organic Conversion Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border border-accent-brass/30 bg-accent-brass/5 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-accent-brass font-medium">
              AI Stylist Conversion
            </span>
            <Sparkles size={14} className="text-accent-brass" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-light text-text-ondark">
              {aiConversionRate > 0 ? `${aiConversionRate}%` : '—'}
            </span>
            <span className="text-[10px] text-text-ondark/50">
              of conversations resulted in an order
            </span>
          </div>
        </div>

        <div className="border border-hairline bg-bg-primary/30 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-text-ondark/50 font-medium">
              Organic Conversion
            </span>
            <TrendingUp size={14} className="text-text-ondark/40" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-light text-text-ondark/70">
              {organicConversionRate > 0 ? `${organicConversionRate}%` : '—'}
            </span>
            <span className="text-[10px] text-text-ondark/50">
              storewide customer conversion baseline
            </span>
          </div>
        </div>
      </div>

      {/* Out of Stock High-Demand Items (Missed Revenue) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-text-ondark/70 font-medium flex items-center gap-1.5">
            <AlertTriangle size={13} className="text-amber-400" />
            High-Demand Out-of-Stock Pieces
          </span>
          <Link
            href="/admin/inventory"
            className="text-[11px] text-accent-brass hover:underline flex items-center gap-1"
          >
            <span>Restock Pipeline</span>
            <ArrowUpRight size={12} />
          </Link>
        </div>

        {outOfStockDemand.length === 0 ? (
          <div className="p-4 border border-hairline bg-bg-primary/20 text-center text-xs text-text-ondark/50 font-light">
            All pieces recommended by the AI Stylist currently maintain healthy stock levels.
          </div>
        ) : (
          <div className="border border-hairline divide-y divide-hairline">
            {outOfStockDemand.map((item) => (
              <div key={item.id} className="p-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-9 h-11 bg-bg-primary overflow-hidden border border-hairline shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[9px] text-text-ondark/30">
                        MV
                      </div>
                    )}
                  </div>
                  <div>
                    <Link
                      href={`/product/${item.slug}`}
                      className="text-xs font-serif font-light text-text-ondark hover:text-accent-brass transition-colors"
                    >
                      {item.name}
                    </Link>
                    <div className="flex items-center gap-2 text-[10px] text-text-ondark/40">
                      <span>{item.category}</span>
                      <span>•</span>
                      <span className="text-rose-400">
                        {item.currentStock === 0 ? '0 in stock' : `${item.currentStock} left`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2 py-0.5 text-[10px] uppercase font-mono border border-amber-500/30 text-amber-400 bg-amber-500/10 block">
                    {item.inquiryCount} {item.inquiryCount === 1 ? 'inquiry' : 'inquiries'}
                  </span>
                  <span className="text-[10px] text-text-ondark/40 mt-0.5 block">
                    ~₹{item.estimatedLostRevenue.toLocaleString('en-IN')} lost demand
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Common Question Themes */}
      <div className="space-y-3 pt-2">
        <span className="text-xs uppercase tracking-wider text-text-ondark/70 font-medium flex items-center gap-1.5">
          <MessageSquare size={13} className="text-accent-brass" />
          Customer Inquiries by Topic Theme
        </span>

        {activeThemes.length === 0 ? (
          <div className="p-4 border border-hairline bg-bg-primary/20 text-center text-xs text-text-ondark/50 font-light">
            No customer conversations recorded yet. Themes will automatically cluster here as shoppers interact with the AI Concierge.
          </div>
        ) : (
          <div className="space-y-2.5">
            {activeThemes.map((theme) => (
              <div
                key={theme.theme}
                className="p-3.5 border border-hairline bg-bg-primary/30 space-y-2 hover:border-hairline/80 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text-ondark">
                      {theme.theme}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-accent-brass/10 border border-accent-brass/30 text-accent-brass">
                      {theme.count} {theme.count === 1 ? 'query' : 'queries'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-text-ondark/50">
                    {theme.percentage}% of chats
                  </span>
                </div>

                <p className="text-[11px] text-text-ondark/60 font-light">
                  {theme.description}
                </p>

                {theme.sampleQueries.length > 0 && (
                  <div className="pt-1.5 border-t border-hairline/40 space-y-1">
                    {theme.sampleQueries.map((sample, sIdx) => (
                      <div
                        key={sIdx}
                        className="text-[10px] text-accent-brass/70 italic flex items-center gap-1.5"
                      >
                        <span className="w-1 h-1 rounded-full bg-accent-brass/50" />
                        <span>&ldquo;{sample}&rdquo;</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
