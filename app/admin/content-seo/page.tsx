import React from 'react';
import { brandConfig } from '@/config/brand.config';
import { getContentEngineData } from '@/lib/db/content';
import { ContentSeoClient } from '@/components/admin/content/ContentSeoClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: `AI Content & SEO — ${brandConfig.name} Admin`,
  description: 'Generate luxury editorial product descriptions and SEO metadata with Google Gemini.',
};

export default async function AdminContentSeoPage() {
  const { products, history, stats } = await getContentEngineData();

  return (
    <ContentSeoClient
      products={products}
      initialHistory={history}
      stats={stats}
    />
  );
}
