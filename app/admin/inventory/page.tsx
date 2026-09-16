import React from 'react';
import {
  Boxes,
  Package,
  AlertTriangle,
  TrendingDown,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { getInventoryDashboardData } from '@/lib/db/inventory';
import { MetricCard } from '@/components/admin/MetricCard';
import { RestockRecommendationsCard } from '@/components/admin/inventory/RestockRecommendationsCard';
import { DemandForecastCard } from '@/components/admin/inventory/DemandForecastCard';
import { StockOverviewTable } from '@/components/admin/inventory/StockOverviewTable';
import { brandConfig } from '@/config/brand.config';

export const revalidate = 0; // Live admin data

export const metadata = {
  title: `Inventory Intelligence — ${brandConfig.name} Admin`,
};

export default async function AdminInventoryPage() {
  const data = await getInventoryDashboardData();

  return (
    <div className="space-y-10 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-hairline pb-6 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-accent-brass font-medium">
            Supply Chain & Replenishment
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-light text-text-ondark tracking-tight mt-1">
            Inventory Intelligence
          </h1>
          <p className="text-xs text-text-ondark/50 font-light mt-1">
            Predictive stock runout forecasting, velocity tracking, and automated replenishment controls.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 border border-hairline bg-bg-deep px-3.5 py-1.5 text-xs text-text-ondark/70">
          <Sparkles size={13} className="text-accent-brass" />
          <span>Calculated Velocity Pipeline</span>
        </div>
      </div>

      {/* 4 Primary Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total SKUs"
          value={data.metrics.totalSkus}
          subtitle="Active variant combinations"
          icon={Boxes}
        />

        <MetricCard
          title="Units in Stock"
          value={data.metrics.totalUnitsInStock.toLocaleString('en-IN')}
          subtitle="Total catalogue inventory"
          icon={Package}
        />

        <MetricCard
          title="Stockout Risk"
          value={data.metrics.outOfStockCount + data.metrics.lowStockCount}
          subtitle={`${data.metrics.outOfStockCount} out of stock, ${data.metrics.lowStockCount} low`}
          icon={AlertTriangle}
          trend={
            data.metrics.outOfStockCount > 0
              ? `${data.metrics.outOfStockCount} critical`
              : 'Inventory healthy'
          }
        />

        <MetricCard
          title="Suggested Reorder"
          value={`+${data.metrics.stockoutRiskVolume}`}
          subtitle="Units recommended for 30d cover"
          icon={ShieldCheck}
        />
      </div>

      {/* Restock Recommendations */}
      <RestockRecommendationsCard
        initialRecommendations={data.restockRecommendations}
      />

      {/* Demand Forecast Chart */}
      <DemandForecastCard
        forecasts={data.demandForecasts}
        productsList={data.productsList}
      />

      {/* Stock Overview Table */}
      <StockOverviewTable initialVariants={data.variants} />
    </div>
  );
}
