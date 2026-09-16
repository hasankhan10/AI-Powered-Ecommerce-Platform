import React from 'react';
import { brandConfig } from '@/config/brand.config';
import { getSupportQueueData } from '@/lib/db/support';
import { SupportQueueClient } from '@/components/admin/support/SupportQueueClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: `Support Queue — ${brandConfig.name} Admin`,
  description: 'Manage automated and escalated customer inquiries with real-time resolution metrics.',
};

export default async function AdminSupportPage() {
  const data = await getSupportQueueData();

  return <SupportQueueClient initialData={data} />;
}
