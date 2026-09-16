import React from 'react';
import { AdminTableSkeleton } from '@/components/ui/Skeleton';

export default function AdminInventoryLoading() {
  return (
    <div className="space-y-8 max-w-7xl w-full">
      <div className="border-b border-hairline pb-6 space-y-2">
        <div className="h-3 w-28 bg-accent-brass/25 rounded animate-pulse" />
        <div className="h-8 w-60 bg-text-ondark/15 rounded animate-pulse" />
        <div className="h-3.5 w-96 max-w-full bg-text-ondark/10 rounded animate-pulse" />
      </div>
      <AdminTableSkeleton rowCount={8} />
    </div>
  );
}
