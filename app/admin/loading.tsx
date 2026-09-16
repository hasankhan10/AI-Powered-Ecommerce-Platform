import React from 'react';
import { AdminOverviewSkeleton } from '@/components/ui/Skeleton';

export default function AdminLoading() {
  return (
    <div className="space-y-8 max-w-7xl w-full">
      <div className="border-b border-hairline pb-6 space-y-2">
        <div className="h-3 w-28 bg-accent-brass/25 rounded animate-pulse" />
        <div className="h-8 w-60 bg-text-ondark/15 rounded animate-pulse" />
      </div>
      <AdminOverviewSkeleton />
    </div>
  );
}
