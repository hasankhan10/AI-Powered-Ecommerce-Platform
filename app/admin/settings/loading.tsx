import React from 'react';

export default function AdminSettingsLoading() {
  return (
    <div className="space-y-8 max-w-5xl w-full animate-pulse">
      <div className="border-b border-hairline pb-6 space-y-2">
        <div className="h-3 w-28 bg-accent-brass/25 rounded" />
        <div className="h-8 w-64 bg-text-ondark/15 rounded" />
        <div className="h-3.5 w-96 max-w-full bg-text-ondark/10 rounded" />
      </div>

      <div className="border border-hairline bg-bg-deep p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-hairline pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-accent-brass/20 rounded" />
            <div className="space-y-1.5">
              <div className="h-4 w-48 bg-text-ondark/20 rounded" />
              <div className="h-3 w-64 bg-text-ondark/10 rounded" />
            </div>
          </div>
          <div className="h-6 w-32 bg-accent-brass/20 rounded" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="h-3 w-36 bg-text-ondark/20 rounded" />
            <div className="h-10 w-full bg-bg-primary border border-hairline rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-36 bg-text-ondark/20 rounded" />
            <div className="h-10 w-full bg-bg-primary border border-hairline rounded" />
          </div>
        </div>

        <div className="h-10 w-full bg-accent-brass/10 border border-accent-brass/20 rounded" />
      </div>
    </div>
  );
}
