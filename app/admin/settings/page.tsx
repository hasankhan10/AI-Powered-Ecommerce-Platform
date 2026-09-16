import React from 'react';
import { brandConfig } from '@/config/brand.config';
import { getShippingSettings } from '@/lib/db/settings';
import { AdminSettingsClient } from '@/components/admin/settings/AdminSettingsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: `Settings — ${brandConfig.name} Admin`,
};

export default async function AdminSettingsPage() {
  const shipping = await getShippingSettings();

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="border-b border-hairline pb-6">
        <span className="text-[10px] uppercase tracking-[0.3em] text-accent-brass font-medium">
          Configuration
        </span>
        <h1 className="font-serif text-3xl font-light text-text-ondark tracking-tight mt-1">
          Store & Delivery Settings
        </h1>
        <p className="text-xs text-text-ondark/50 font-light mt-1">
          Configure regional pricing rules, free shipping thresholds, and delivery parameters.
        </p>
      </div>

      <AdminSettingsClient initialShipping={shipping} />
    </div>
  );
}
