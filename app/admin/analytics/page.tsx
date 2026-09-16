import React from 'react';
import {
  DollarSign,
  ShoppingBag,
  MessageSquare,
  TrendingUp,
  Sparkles,
  Zap,
} from 'lucide-react';
import { getAnalyticsDashboardData } from '@/lib/db/analytics';
import { MetricCard } from '@/components/admin/MetricCard';
import { RevenueComparisonChart } from '@/components/admin/analytics/RevenueComparisonChart';
import { TopProductsTable } from '@/components/admin/analytics/TopProductsTable';
import { AIAssistantInsightsCard } from '@/components/admin/analytics/AIAssistantInsightsCard';
import { CustomerSegmentsCard } from '@/components/admin/analytics/CustomerSegmentsCard';
import { brandConfig } from '@/config/brand.config';

export const revalidate = 0; // Live admin data

export const metadata = {
  title: `AI Business Analytics — ${brandConfig.name} Admin`,
};

export default async function AdminAnalyticsPage() {
  const data = await getAnalyticsDashboardData();

  const formattedRevenue = new Intl.NumberFormat(brandConfig.currency.locale, {
    style: 'currency',
    currency: brandConfig.currency.code,
    maximumFractionDigits: 0,
  }).format(data.metrics.totalRevenue);

  const formattedAOV = new Intl.NumberFormat(brandConfig.currency.locale, {
    style: 'currency',
    currency: brandConfig.currency.code,
    maximumFractionDigits: 0,
  }).format(data.metrics.averageOrderValue);

  return (
    <div className="space-y-10 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-hairline pb-6 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-accent-brass font-medium">
            Intelligence & Machine Telemetry
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-light text-text-ondark tracking-tight mt-1">
            AI Business Analytics
          </h1>
          <p className="text-xs text-text-ondark/50 font-light mt-1">
            Real-time revenue trajectories, conversational intent clusters, and customer retention metrics.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 border border-hairline bg-bg-deep px-3.5 py-1.5 text-xs text-text-ondark/70">
          <Sparkles size={13} className="text-accent-brass" />
          <span>Live Database Aggregates</span>
        </div>
      </div>

      {/* 4 Primary Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={formattedRevenue}
          subtitle={`${data.metrics.paidOrders} verified orders`}
          icon={DollarSign}
          trend={
            data.metrics.revenueGrowth !== 0
              ? `${data.metrics.revenueGrowth > 0 ? '+' : ''}${data.metrics.revenueGrowth}% vs prev 30d`
              : 'Verified Live'
          }
        />

        <MetricCard
          title="Average Order Value"
          value={formattedAOV}
          subtitle="Revenue per paid transaction"
          icon={TrendingUp}
        />

        <MetricCard
          title="AI Stylist Conversations"
          value={data.metrics.aiConversations}
          subtitle="Shopper concierge sessions"
          icon={MessageSquare}
        />

        <MetricCard
          title="AI-Assisted Conversion"
          value={data.metrics.aiConversionRate > 0 ? `${data.metrics.aiConversionRate}%` : '—'}
          subtitle={
            data.metrics.aiAssistedOrders > 0
              ? `${data.metrics.aiAssistedOrders} orders post-chat`
              : 'Awaiting first conversion'
          }
          icon={Zap}
        />
      </div>

      {/* Row 1: Revenue Comparison Chart & Top Performing Pieces */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <RevenueComparisonChart
            timeline7D={data.revenueTimeline7D}
            timeline14D={data.revenueTimeline14D}
            timeline30D={data.revenueTimeline30D}
          />
        </div>

        <div className="lg:col-span-5">
          <TopProductsTable products={data.topProducts} />
        </div>
      </div>

      {/* Row 2: AI Stylist Telemetry & Customer Segments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <AIAssistantInsightsCard
            outOfStockDemand={data.aiInsights.outOfStockDemand}
            questionThemes={data.aiInsights.questionThemes}
            aiConversionRate={data.aiInsights.aiAssistedConversionRate}
            organicConversionRate={data.aiInsights.organicConversionRate}
            totalInquiries={data.aiInsights.totalInquiriesAnalyzed}
          />
        </div>

        <div className="lg:col-span-5">
          <CustomerSegmentsCard segments={data.customerSegments} />
        </div>
      </div>
    </div>
  );
}
