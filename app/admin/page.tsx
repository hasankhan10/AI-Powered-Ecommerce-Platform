import React from 'react';
import {
  DollarSign,
  ShoppingBag,
  MessageSquare,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { getAdminOverviewData } from '@/lib/db/admin';
import { MetricCard } from '@/components/admin/MetricCard';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { RecentOrdersTable } from '@/components/admin/RecentOrdersTable';
import { brandConfig } from '@/config/brand.config';

export const revalidate = 0; // Live admin data

export const metadata = {
  title: `Overview — ${brandConfig.name} Operator Console`,
};

export default async function AdminOverviewPage() {
  const data = await getAdminOverviewData();

  const formattedRevenue = new Intl.NumberFormat(brandConfig.currency.locale, {
    style: 'currency',
    currency: brandConfig.currency.code,
    maximumFractionDigits: 0,
  }).format(data.metrics.totalRevenue);

  return (
    <div className="space-y-10 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-hairline pb-6 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-accent-brass font-medium">
            Intelligence & Operations
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-light text-text-ondark tracking-tight mt-1">
            Store Overview
          </h1>
        </div>

        <div className="inline-flex items-center gap-2 border border-hairline bg-bg-deep px-3.5 py-1.5 text-xs text-text-ondark/70">
          <Sparkles size={13} className="text-accent-brass" />
          <span>Real-time aggregate data</span>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={formattedRevenue}
          subtitle={`${data.metrics.paidOrders} paid orders`}
          icon={DollarSign}
          trend={data.metrics.totalRevenue > 0 ? '+ Verified Live' : 'Awaiting first order'}
        />

        <MetricCard
          title="Total Orders"
          value={data.metrics.totalOrders}
          subtitle={`${data.metrics.paidOrders} completed`}
          icon={ShoppingBag}
        />

        <MetricCard
          title="AI Conversations"
          value={data.metrics.aiConversations}
          subtitle="Customer styling interactions"
          icon={MessageSquare}
        />

        <MetricCard
          title="AI Conversion Rate"
          value={data.metrics.aiConversionRate > 0 ? `${data.metrics.aiConversionRate}%` : '—'}
          subtitle={
            data.metrics.aiConversations > 0
              ? 'Stylist-assisted transactions'
              : 'No stylist chats yet'
          }
          icon={TrendingUp}
        />
      </div>

      {/* Charts & Activity Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue Chart (7 cols) */}
        <div className="lg:col-span-7">
          <RevenueChart data={data.revenueTimeline} />
        </div>

        {/* Recent Activity Table (5 cols) */}
        <div className="lg:col-span-5">
          <RecentOrdersTable orders={data.recentOrders} />
        </div>
      </div>
    </div>
  );
}
