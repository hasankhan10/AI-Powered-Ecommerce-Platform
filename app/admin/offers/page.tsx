import React from 'react';
import { requireAdmin } from '@/lib/auth/admin';
import { getOfferCoupons } from '@/lib/db/offers';
import { AdminOffersClient } from '@/components/admin/offers/AdminOffersClient';
import { brandConfig } from '@/config/brand.config';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: `Offers & Promo Codes — ${brandConfig.name} Admin`,
  description: 'Manage storewide percentage discount campaigns and promo codes.',
};

export default async function AdminOffersPage() {
  await requireAdmin();
  const offers = await getOfferCoupons();

  return <AdminOffersClient initialOffers={offers} />;
}
