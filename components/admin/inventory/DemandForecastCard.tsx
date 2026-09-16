'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TrendingUp, Package, Calendar } from 'lucide-react';
import { ProductDemandForecast } from '@/lib/db/inventory';

interface DemandForecastCardProps {
  forecasts: ProductDemandForecast[];
  productsList: { id: string; name: string }[];
}

export function DemandForecastCard({
  forecasts,
  productsList,
}: DemandForecastCardProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>(() => {
    return forecasts[0]?.productId || productsList[0]?.id || '';
  });

  const activeForecast = forecasts.find((f) => f.productId === selectedProductId) || forecasts[0];

  if (!activeForecast) return null;

  return (
    <div className="border border-hairline bg-bg-deep p-4 sm:p-6 space-y-4 sm:space-y-6 rounded-md shadow-sm">
      {/* Header with Product Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-hairline pb-4 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium flex items-center gap-1.5">
            <TrendingUp size={12} />
            Forecasting Engine
          </span>
          <h3 className="font-serif text-lg sm:text-xl font-light text-text-ondark mt-0.5">
            Product Demand & Stock Depletion Forecast
          </h3>
        </div>

        {/* Product Dropdown Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-text-ondark/50">Select Piece:</span>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="bg-bg-primary border border-hairline text-text-ondark text-xs px-3 py-1.5 focus:outline-none focus:border-accent-brass cursor-pointer"
          >
            {productsList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Stats for Selected Product */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 border-b border-hairline/60 pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-text-ondark/40 block">
            Current Stock
          </span>
          <span className="font-serif text-lg font-light text-text-ondark">
            {activeForecast.currentStock} units
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-wider text-text-ondark/40 block">
            Daily Run-Rate
          </span>
          <span className="font-serif text-lg font-light text-accent-brass">
            ~{activeForecast.dailyVelocity} units/day
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-wider text-text-ondark/40 block">
            Forecast Horizon
          </span>
          <span className="font-serif text-lg font-light text-text-ondark/70">
            14 Days Forward
          </span>
        </div>
      </div>

      {/* Forecast Chart Canvas */}
      <div className="h-[280px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={activeForecast.forecastPoints}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B08D57" stopOpacity={0.4} />
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
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-bg-deep border border-hairline p-3 shadow-xl space-y-1.5 text-xs">
                      <span className="text-[10px] uppercase font-mono text-text-ondark/50 block">
                        {label}
                      </span>
                      {payload.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4">
                          <span
                            className="flex items-center gap-1.5"
                            style={{ color: item.color }}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: item.color }}
                            />
                            {item.name}:
                          </span>
                          <span className="font-mono font-medium text-text-ondark">
                            {item.value} units
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              formatter={(value) => <span className="text-text-ondark/70">{value}</span>}
            />
            {/* Historical Actual Orders */}
            <Area
              type="monotone"
              dataKey="actualDemand"
              name="Historical Orders"
              stroke="#B08D57"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#actualGrad)"
            />
            {/* Projected Forward Demand */}
            <Line
              type="monotone"
              dataKey="projectedDemand"
              name="Forecasted Demand"
              stroke="#38bdf8"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: '#38bdf8' }}
            />
            {/* Projected Remaining Stock */}
            <Line
              type="monotone"
              dataKey="projectedStock"
              name="Projected Inventory Depletion"
              stroke="#f43f5e"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
