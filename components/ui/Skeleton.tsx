'use client';

import React from 'react';

/**
 * Base luxury shimmer box
 */
export function Skeleton({
  className = '',
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`relative overflow-hidden bg-bg-deep/80 rounded border border-hairline/40 animate-pulse ${className}`}
      style={style}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
    </div>
  );
}

/**
 * Skeleton for E-Commerce Product Cards (Shop, Collections, Recommendations)
 */
export function ProductCardSkeleton() {
  return (
    <div className="rounded-md border border-hairline bg-bg-deep overflow-hidden flex flex-col h-full animate-pulse">
      {/* Product Image Skeleton */}
      <div className="aspect-[3/4] w-full bg-bg-primary/70 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-bg-deep/60 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 h-4 w-16 bg-accent-brass/20 rounded" />
      </div>

      {/* Info Details */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-2.5 w-20 bg-accent-brass/20 rounded" />
          <div className="h-4 w-5/6 bg-text-ondark/15 rounded" />
          <div className="h-3.5 w-24 bg-text-ondark/10 rounded" />
        </div>
        <div className="h-9 w-full bg-accent-brass/10 border border-accent-brass/20 rounded mt-3" />
      </div>
    </div>
  );
}

/**
 * Skeleton for Product Detail Page (PDP)
 */
export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 max-w-7xl mx-auto w-full">
      {/* Gallery Left Column */}
      <div className="lg:col-span-7 space-y-4">
        <div className="aspect-[3/4] w-full bg-bg-deep border border-hairline rounded-lg overflow-hidden relative animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-transparent to-transparent" />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-bg-deep border border-hairline rounded animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Details Right Column */}
      <div className="lg:col-span-5 space-y-6">
        {/* Header info */}
        <div className="space-y-3 border-b border-hairline pb-6">
          <div className="h-3 w-28 bg-accent-brass/25 rounded animate-pulse" />
          <div className="h-8 w-4/5 bg-text-ondark/15 rounded animate-pulse" />
          <div className="h-6 w-36 bg-accent-brass/35 rounded animate-pulse" />
        </div>

        {/* Variant Selectors */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-text-ondark/20 rounded" />
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-9 w-20 bg-bg-deep border border-hairline rounded animate-pulse"
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="h-3 w-16 bg-text-ondark/20 rounded" />
            <div className="flex gap-2">
              {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                <div
                  key={size}
                  className="h-10 w-12 bg-bg-deep border border-hairline rounded animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Add to Bag CTA */}
        <div className="space-y-3 pt-4">
          <div className="h-12 w-full bg-accent-brass/20 border border-accent-brass/30 rounded animate-pulse" />
          <div className="h-10 w-full bg-bg-deep border border-hairline rounded animate-pulse" />
        </div>

        {/* Accordions / Highlights */}
        <div className="space-y-3 pt-6 border-t border-hairline">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="p-4 border border-hairline bg-bg-deep flex items-center justify-between animate-pulse"
            >
              <div className="h-3.5 w-36 bg-text-ondark/20 rounded" />
              <div className="h-4 w-4 bg-text-ondark/10 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for Admin Tables (Orders, Products, Inventory, Support)
 */
export function AdminTableSkeleton({ rowCount = 6 }: { rowCount?: number }) {
  return (
    <div className="space-y-6 w-full animate-pulse">
      {/* Filter / Search Bar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-8 w-24 bg-bg-deep border border-hairline rounded"
            />
          ))}
        </div>
        <div className="h-8 w-full sm:w-64 bg-bg-deep border border-hairline rounded" />
      </div>

      {/* Table Container Skeleton */}
      <div className="border border-hairline bg-bg-deep overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-hairline p-4 flex items-center justify-between bg-bg-primary/40">
          <div className="h-3.5 w-24 bg-accent-brass/25 rounded" />
          <div className="h-3.5 w-32 bg-text-ondark/15 rounded hidden sm:block" />
          <div className="h-3.5 w-20 bg-text-ondark/15 rounded" />
          <div className="h-3.5 w-20 bg-text-ondark/15 rounded text-right" />
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-hairline">
          {[...Array(rowCount)].map((_, i) => (
            <div
              key={i}
              className="p-4 flex items-center justify-between gap-4"
              style={{ animationDelay: `${i * 75}ms` }}
            >
              <div className="space-y-1.5 w-1/4">
                <div className="h-3.5 w-28 bg-accent-brass/30 rounded font-mono" />
                <div className="h-2.5 w-16 bg-text-ondark/10 rounded" />
              </div>
              <div className="space-y-1 w-1/3 hidden sm:block">
                <div className="h-3.5 w-32 bg-text-ondark/20 rounded" />
                <div className="h-2.5 w-44 bg-text-ondark/10 rounded" />
              </div>
              <div className="h-6 w-24 bg-bg-primary border border-hairline rounded" />
              <div className="h-4 w-16 bg-text-ondark/20 rounded text-right" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for Admin Dashboard Overview (KPI cards + chart + recent list)
 */
export function AdminOverviewSkeleton() {
  return (
    <div className="space-y-8 w-full animate-pulse">
      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="border border-hairline bg-bg-deep p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 bg-accent-brass/25 rounded" />
              <div className="h-6 w-6 bg-accent-brass/20 rounded-full" />
            </div>
            <div className="h-7 w-32 bg-text-ondark/25 rounded" />
            <div className="h-2.5 w-40 bg-text-ondark/10 rounded" />
          </div>
        ))}
      </div>

      {/* Main Grid: Chart + Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border border-hairline bg-bg-deep p-6 space-y-4">
          <div className="h-4 w-44 bg-accent-brass/30 rounded" />
          <div className="h-64 w-full bg-bg-primary/50 border border-hairline/40 rounded flex items-end p-4 gap-3">
            {[40, 65, 30, 85, 55, 95, 70, 80, 60, 90, 75, 100].map((h, idx) => (
              <div
                key={idx}
                className="flex-1 bg-accent-brass/20 rounded-t"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>

        <div className="border border-hairline bg-bg-deep p-6 space-y-4">
          <div className="h-4 w-36 bg-accent-brass/30 rounded" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="p-3 border border-hairline bg-bg-primary/30 flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="h-3 w-24 bg-text-ondark/20 rounded" />
                  <div className="h-2.5 w-32 bg-text-ondark/10 rounded" />
                </div>
                <div className="h-3.5 w-12 bg-accent-brass/30 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for Customer Account / Order History
 */
export function AccountSkeleton() {
  return (
    <div className="space-y-10 max-w-5xl mx-auto w-full animate-pulse">
      {/* Profile Header */}
      <div className="border border-hairline bg-bg-deep p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-accent-brass/20 border border-accent-brass/30 shrink-0" />
          <div className="space-y-2">
            <div className="h-5 w-44 bg-text-ondark/20 rounded" />
            <div className="h-3 w-56 bg-text-ondark/10 rounded" />
          </div>
        </div>
        <div className="h-9 w-32 bg-bg-primary border border-hairline rounded" />
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-hairline pb-3">
        <div className="h-4 w-28 bg-accent-brass/30 rounded" />
        <div className="h-4 w-28 bg-text-ondark/15 rounded" />
        <div className="h-4 w-28 bg-text-ondark/15 rounded" />
      </div>

      {/* Order Cards */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="border border-hairline bg-bg-deep p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div className="space-y-1">
                <div className="h-3.5 w-36 bg-accent-brass/30 rounded font-mono" />
                <div className="h-2.5 w-24 bg-text-ondark/10 rounded" />
              </div>
              <div className="h-6 w-20 bg-bg-primary border border-hairline rounded" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-14 w-12 bg-bg-primary border border-hairline rounded shrink-0" />
              <div className="space-y-1 flex-1">
                <div className="h-3.5 w-48 bg-text-ondark/20 rounded" />
                <div className="h-2.5 w-28 bg-text-ondark/10 rounded" />
              </div>
              <div className="h-4 w-16 bg-text-ondark/20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for Checkout Page (Form + Order Summary)
 */
export function CheckoutSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 max-w-7xl mx-auto w-full animate-pulse">
      {/* Left Form Column */}
      <div className="lg:col-span-7 space-y-8">
        {/* Shipping Form Skeleton */}
        <div className="border border-hairline bg-bg-deep p-6 sm:p-8 space-y-5">
          <div className="h-4 w-40 bg-accent-brass/30 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <div className="h-2.5 w-16 bg-text-ondark/20 rounded" />
              <div className="h-9 w-full bg-bg-primary border border-hairline rounded" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <div className="h-2.5 w-24 bg-text-ondark/20 rounded" />
              <div className="h-9 w-full bg-bg-primary border border-hairline rounded" />
            </div>
            <div className="space-y-1.5">
              <div className="h-2.5 w-12 bg-text-ondark/20 rounded" />
              <div className="h-9 w-full bg-bg-primary border border-hairline rounded" />
            </div>
            <div className="space-y-1.5">
              <div className="h-2.5 w-16 bg-text-ondark/20 rounded" />
              <div className="h-9 w-full bg-bg-primary border border-hairline rounded" />
            </div>
          </div>
        </div>

        {/* Payment Method Selector Skeleton */}
        <div className="border border-hairline bg-bg-deep p-6 sm:p-8 space-y-4">
          <div className="h-4 w-36 bg-accent-brass/30 rounded" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-bg-primary border border-hairline rounded" />
            <div className="h-16 bg-bg-primary border border-hairline rounded" />
          </div>
        </div>

        <div className="h-12 w-full bg-accent-brass/25 border border-accent-brass/30 rounded" />
      </div>

      {/* Right Order Summary Column */}
      <div className="lg:col-span-5">
        <div className="border border-hairline bg-bg-deep p-6 sm:p-8 space-y-6 sticky top-24">
          <div className="h-4 w-32 bg-accent-brass/30 rounded" />
          <div className="divide-y divide-hairline">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-12 bg-bg-primary border border-hairline rounded shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-3.5 w-32 bg-text-ondark/20 rounded" />
                    <div className="h-2.5 w-20 bg-text-ondark/10 rounded" />
                  </div>
                </div>
                <div className="h-3.5 w-14 bg-text-ondark/20 rounded" />
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-4 border-t border-hairline">
            <div className="flex justify-between">
              <div className="h-3 w-16 bg-text-ondark/15 rounded" />
              <div className="h-3 w-14 bg-text-ondark/15 rounded" />
            </div>
            <div className="flex justify-between">
              <div className="h-3 w-16 bg-text-ondark/15 rounded" />
              <div className="h-3 w-14 bg-accent-brass/30 rounded" />
            </div>
            <div className="flex justify-between pt-2 border-t border-hairline">
              <div className="h-4 w-20 bg-text-ondark/30 rounded" />
              <div className="h-5 w-24 bg-accent-brass/40 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
