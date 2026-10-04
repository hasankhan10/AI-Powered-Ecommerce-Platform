import { db } from '@/lib/prisma';

export interface OfferCoupon {
  id: string;
  code: string;
  discountPercent: number;
  title: string;
  description?: string;
  minOrderValue?: number;
  maxDiscount?: number | null;
  isActive: boolean;
  usageCount: number;
  expiresAt?: string | null;
  createdAt: string;
}

export const DEFAULT_OFFERS: OfferCoupon[] = [
  {
    id: 'off_welcome10',
    code: 'WELCOME10',
    discountPercent: 10,
    title: 'Welcome First Order',
    description: '10% discount on your entire order',
    minOrderValue: 0,
    maxDiscount: null,
    isActive: true,
    usageCount: 14,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'off_maison20',
    code: 'MAISON20',
    discountPercent: 20,
    title: 'Maison Luxe Privilege',
    description: '20% off on orders above ₹3,000 across all collections',
    minOrderValue: 3000,
    maxDiscount: null,
    isActive: true,
    usageCount: 8,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'off_festive15',
    code: 'FESTIVE15',
    discountPercent: 15,
    title: 'Festive Season Special',
    description: '15% off on all luxury apparel & handcrafted accessories',
    minOrderValue: 2000,
    maxDiscount: null,
    isActive: true,
    usageCount: 22,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

function generateId() {
  return 'off_' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

/**
 * Fetch all offer coupons from database with fallback defaults.
 */
export async function getOfferCoupons(): Promise<OfferCoupon[]> {
  try {
    const records = await db.orm.public.IntegrationConnection.where({
      provider: 'offers',
    }).all();

    if (records.length > 0 && records[0].config) {
      const configObj =
        typeof records[0].config === 'string'
          ? JSON.parse(records[0].config)
          : records[0].config;

      if (Array.isArray(configObj.offers)) {
        return configObj.offers;
      }
    }

    // Seed default offers if none exist
    await saveOfferCoupons(DEFAULT_OFFERS);
    return DEFAULT_OFFERS;
  } catch (error) {
    console.error('Error fetching offer coupons:', error);
    return DEFAULT_OFFERS;
  }
}

/**
 * Save complete list of offer coupons to database.
 */
export async function saveOfferCoupons(offers: OfferCoupon[]): Promise<boolean> {
  try {
    const records = await db.orm.public.IntegrationConnection.where({
      provider: 'offers',
    }).all();

    const payload = { offers };

    if (records.length > 0) {
      await db.raw.sql`
        UPDATE "IntegrationConnection"
        SET "config" = ${JSON.stringify(payload)}::json,
            "status" = 'CONNECTED',
            "updatedAt" = now()
        WHERE "provider" = 'offers'
      `;
    } else {
      await db.orm.public.IntegrationConnection.create({
        id: generateId(),
        provider: 'offers',
        status: 'CONNECTED',
        config: payload as any,
      });
    }

    return true;
  } catch (error) {
    console.error('Error saving offer coupons:', error);
    return false;
  }
}

/**
 * Create a new offer coupon.
 */
export async function createOfferCoupon(data: {
  code: string;
  discountPercent: number;
  title: string;
  description?: string;
  minOrderValue?: number;
  maxDiscount?: number | null;
  isActive?: boolean;
  expiresAt?: string | null;
}): Promise<OfferCoupon> {
  const offers = await getOfferCoupons();
  const normalizedCode = data.code.trim().toUpperCase();

  // Check duplicate code
  const exists = offers.some((o) => o.code.toUpperCase() === normalizedCode);
  if (exists) {
    throw new Error(`An offer code "${normalizedCode}" already exists.`);
  }

  const newOffer: OfferCoupon = {
    id: generateId(),
    code: normalizedCode,
    discountPercent: Math.min(100, Math.max(1, Number(data.discountPercent))),
    title: data.title.trim(),
    description: data.description?.trim() || '',
    minOrderValue: Math.max(0, Number(data.minOrderValue || 0)),
    maxDiscount: data.maxDiscount ? Math.max(0, Number(data.maxDiscount)) : null,
    isActive: data.isActive !== false,
    usageCount: 0,
    expiresAt: data.expiresAt || null,
    createdAt: new Date().toISOString(),
  };

  offers.unshift(newOffer);
  await saveOfferCoupons(offers);
  return newOffer;
}

/**
 * Update an existing offer coupon.
 */
export async function updateOfferCoupon(
  id: string,
  updates: Partial<OfferCoupon>
): Promise<OfferCoupon | null> {
  const offers = await getOfferCoupons();
  const index = offers.findIndex((o) => o.id === id);
  if (index === -1) return null;

  if (updates.code) {
    const normalizedCode = updates.code.trim().toUpperCase();
    const duplicate = offers.some(
      (o) => o.id !== id && o.code.toUpperCase() === normalizedCode
    );
    if (duplicate) {
      throw new Error(`An offer with code "${normalizedCode}" already exists.`);
    }
    updates.code = normalizedCode;
  }

  if (updates.discountPercent !== undefined) {
    updates.discountPercent = Math.min(100, Math.max(1, Number(updates.discountPercent)));
  }

  offers[index] = {
    ...offers[index],
    ...updates,
  };

  await saveOfferCoupons(offers);
  return offers[index];
}

/**
 * Delete an offer coupon.
 */
export async function deleteOfferCoupon(id: string): Promise<boolean> {
  const offers = await getOfferCoupons();
  const filtered = offers.filter((o) => o.id !== id);
  if (filtered.length === offers.length) return false;

  await saveOfferCoupons(filtered);
  return true;
}

/**
 * Validate an offer code against subtotal and calculate discount.
 */
export async function validateOfferCode(
  code: string,
  subtotal: number
): Promise<{
  valid: boolean;
  error?: string;
  offer?: OfferCoupon;
  discountAmount?: number;
  finalTotal?: number;
}> {
  if (!code || !code.trim()) {
    return { valid: false, error: 'Please enter a promo code.' };
  }

  const normalized = code.trim().toUpperCase();
  const offers = await getOfferCoupons();
  const offer = offers.find((o) => o.code.toUpperCase() === normalized);

  if (!offer) {
    return { valid: false, error: `Promo code "${normalized}" is invalid.` };
  }

  if (!offer.isActive) {
    return { valid: false, error: `Promo code "${normalized}" is currently inactive.` };
  }

  if (offer.expiresAt && new Date(offer.expiresAt) < new Date()) {
    return { valid: false, error: `Promo code "${normalized}" has expired.` };
  }

  if (offer.minOrderValue && subtotal < offer.minOrderValue) {
    return {
      valid: false,
      error: `Promo code "${normalized}" requires a minimum order of ₹${offer.minOrderValue.toLocaleString('en-IN')}.`,
    };
  }

  // Calculate percentage discount
  let discount = Math.round((subtotal * offer.discountPercent) / 100);
  if (offer.maxDiscount && discount > offer.maxDiscount) {
    discount = offer.maxDiscount;
  }

  const finalTotal = Math.max(0, subtotal - discount);

  return {
    valid: true,
    offer,
    discountAmount: discount,
    finalTotal,
  };
}

/**
 * Increment usage count when an order completes.
 */
export async function incrementOfferUsage(code: string): Promise<void> {
  try {
    const normalized = code.trim().toUpperCase();
    const offers = await getOfferCoupons();
    const index = offers.findIndex((o) => o.code.toUpperCase() === normalized);
    if (index !== -1) {
      offers[index].usageCount = (offers[index].usageCount || 0) + 1;
      await saveOfferCoupons(offers);
    }
  } catch (err) {
    console.warn('Could not increment offer usage count:', err);
  }
}
