'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface RevenueChartProps {
  data: {
    date: string;
    revenue: number;
    orders: number;
  }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="border border-hairline bg-bg-deep p-4 sm:p-6 space-y-4 sm:space-y-6 rounded-md shadow-sm">
      <div className="flex items-center justify-between border-b border-hairline pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium">
            Financial Trends
          </span>
          <h3 className="font-serif text-lg sm:text-xl font-light text-text-ondark">
            Revenue Over Time
          </h3>
        </div>
        <span className="text-xs text-text-ondark/50 font-mono">INR (₹)</span>
      </div>

      <div className="h-60 sm:h-72 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="brassGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C6A87D" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#C6A87D" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(243, 238, 232, 0.08)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="rgba(243, 238, 232, 0.4)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="rgba(243, 238, 232, 0.4)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="border border-hairline bg-bg-primary p-3 shadow-xl space-y-1 rounded-md">
                      <p className="text-[10px] uppercase tracking-wider text-accent-brass">
                        {label}
                      </p>
                      <p className="font-serif text-sm text-text-ondark font-light">
                        Revenue: ₹{Number(payload[0].value).toLocaleString('en-IN')}
                      </p>
                      <p className="text-[11px] text-text-ondark/60 font-mono">
                        Orders: {payload[0].payload.orders}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#C6A87D"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#brassGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
