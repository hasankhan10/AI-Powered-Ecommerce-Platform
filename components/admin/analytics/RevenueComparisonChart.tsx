'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Layers } from 'lucide-react';
import { AnalyticsRevenuePoint } from '@/lib/db/analytics';

interface RevenueComparisonChartProps {
  timeline7D: AnalyticsRevenuePoint[];
  timeline14D: AnalyticsRevenuePoint[];
  timeline30D: AnalyticsRevenuePoint[];
}

export function RevenueComparisonChart({
  timeline7D,
  timeline14D,
  timeline30D,
}: RevenueComparisonChartProps) {
  const [period, setPeriod] = useState<'7D' | '14D' | '30D'>('14D');
  const [showComparison, setShowComparison] = useState(true);

  const activeData =
    period === '7D'
      ? timeline7D
      : period === '14D'
      ? timeline14D
      : timeline30D;

  const currentTotal = activeData.reduce((s, d) => s + d.revenue, 0);
  const prevTotal = activeData.reduce((s, d) => s + d.prevRevenue, 0);
  const diff = currentTotal - prevTotal;
  const growthRate =
    prevTotal > 0
      ? Math.round((diff / prevTotal) * 100)
      : currentTotal > 0
      ? 100
      : 0;

  const isPositive = growthRate >= 0;

  return (
    <div className="border border-hairline bg-bg-deep p-4 sm:p-6 space-y-4 sm:space-y-6 rounded-md shadow-sm">
      {/* Header with Period Switcher and Comparison Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium block">
            Sales Trajectory
          </span>
          <h3 className="font-serif text-lg sm:text-xl font-light text-text-ondark mt-0.5">
            Revenue & Period Comparison
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Compare Toggle */}
          <button
            type="button"
            onClick={() => setShowComparison(!showComparison)}
            className={`px-3 py-1.5 text-[11px] uppercase tracking-wider flex items-center gap-1.5 border transition-colors ${
              showComparison
                ? 'border-accent-brass/50 bg-accent-brass/10 text-accent-brass'
                : 'border-hairline text-text-ondark/40 hover:text-text-ondark'
            }`}
          >
            <Layers size={12} />
            <span>Comparison</span>
          </button>

          {/* Period Tabs */}
          <div className="flex items-center border border-hairline bg-bg-primary/60 p-0.5">
            {(['7D', '14D', '30D'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-[10px] uppercase tracking-wider font-mono transition-colors ${
                  period === p
                    ? 'bg-accent-brass text-bg-primary font-bold'
                    : 'text-text-ondark/50 hover:text-text-ondark'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 border-t border-hairline/60">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-text-ondark/40 block">
            Current Period ({period})
          </span>
          <span className="font-serif text-lg font-light text-text-ondark">
            ₹{currentTotal.toLocaleString('en-IN')}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-wider text-text-ondark/40 block">
            Previous Period
          </span>
          <span className="font-serif text-lg font-light text-text-ondark/70">
            ₹{prevTotal.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <span className="text-[10px] uppercase tracking-wider text-text-ondark/40 block">
            Period Growth
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isPositive ? (
              <TrendingUp size={14} className="text-emerald-400" />
            ) : (
              <TrendingDown size={14} className="text-rose-400" />
            )}
            <span
              className={`text-sm font-mono font-medium ${
                isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {growthRate > 0 ? `+${growthRate}%` : `${growthRate}%`}
            </span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[280px] w-full pt-4">
        {currentTotal === 0 && prevTotal === 0 ? (
          <div className="h-full flex flex-col items-center justify-center border border-dashed border-hairline space-y-2 text-center p-6">
            <Calendar size={28} className="text-accent-brass/40" />
            <p className="text-xs text-text-ondark/60 font-light">
              No sales transactions recorded in this period.
            </p>
            <p className="text-[10px] text-text-ondark/40">
              Orders placed on the storefront will appear on this live timeline.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="currentRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B08D57" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#B08D57" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(242, 236, 224, 0.07)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="rgba(242, 236, 224, 0.3)"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: 'rgba(242, 236, 224, 0.1)' }}
              />
              <YAxis
                stroke="rgba(242, 236, 224, 0.3)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload as AnalyticsRevenuePoint;
                    return (
                      <div className="bg-bg-deep border border-hairline p-3 shadow-xl space-y-1.5 text-xs">
                        <span className="text-[10px] uppercase font-mono text-text-ondark/50 block">
                          {d.fullDate}
                        </span>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-accent-brass flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-accent-brass" />
                            Current:
                          </span>
                          <span className="font-serif font-medium text-text-ondark">
                            ₹{d.revenue.toLocaleString('en-IN')}
                          </span>
                        </div>
                        {showComparison && (
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-text-ondark/50 flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-text-ondark/30" />
                              Previous:
                            </span>
                            <span className="font-serif text-text-ondark/70">
                              ₹{d.prevRevenue.toLocaleString('en-IN')}
                            </span>
                          </div>
                        )}
                        <div className="pt-1 border-t border-hairline text-[10px] text-text-ondark/40">
                          {d.orders} {d.orders === 1 ? 'order' : 'orders'} placed
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {showComparison && (
                <Area
                  type="monotone"
                  dataKey="prevRevenue"
                  stroke="rgba(242, 236, 224, 0.35)"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  fill="transparent"
                />
              )}
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#B08D57"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#currentRevGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
