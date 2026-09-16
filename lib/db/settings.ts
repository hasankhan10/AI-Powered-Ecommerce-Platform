import { db } from '@/lib/prisma';

export interface ShippingSettings {
  freeDeliveryThreshold: number; // Minimum order price for free delivery (e.g. ₹2,000 / ₹5,000)
  standardDeliveryFee: number;   // Standard delivery charge if order is below threshold (e.g. ₹150)
  enableFreeDelivery: boolean;   // Whether the free delivery rule is active
  estimatedDeliveryDays: string; // Delivery time estimate (e.g. "3-5 Business Days")
  expressDeliveryFee?: number;   // Optional express shipping fee
}

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  freeDeliveryThreshold: 2000,
  standardDeliveryFee: 150,
  enableFreeDelivery: true,
  estimatedDeliveryDays: '3-5 Business Days',
  expressDeliveryFee: 350,
};

function generateId() {
  return 'conn_' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

/**
 * Fetch persistent shipping settings from DB (IntegrationConnection table)
 * with robust fallback to luxury brand defaults.
 */
export async function getShippingSettings(): Promise<ShippingSettings> {
  try {
    const records = await db.orm.public.IntegrationConnection.where({
      provider: 'shipping',
    }).all();

    if (records.length > 0 && records[0].config) {
      const configObj =
        typeof records[0].config === 'string'
          ? JSON.parse(records[0].config)
          : records[0].config;

      return {
        ...DEFAULT_SHIPPING_SETTINGS,
        ...configObj,
        freeDeliveryThreshold: Math.max(
          0,
          Number(configObj.freeDeliveryThreshold ?? DEFAULT_SHIPPING_SETTINGS.freeDeliveryThreshold)
        ),
        standardDeliveryFee: Math.max(
          0,
          Number(configObj.standardDeliveryFee ?? DEFAULT_SHIPPING_SETTINGS.standardDeliveryFee)
        ),
        enableFreeDelivery:
          configObj.enableFreeDelivery !== undefined
            ? Boolean(configObj.enableFreeDelivery)
            : DEFAULT_SHIPPING_SETTINGS.enableFreeDelivery,
        estimatedDeliveryDays:
          configObj.estimatedDeliveryDays || DEFAULT_SHIPPING_SETTINGS.estimatedDeliveryDays,
      };
    }
  } catch (error) {
    console.error('Error fetching shipping settings:', error);
  }

  return DEFAULT_SHIPPING_SETTINGS;
}

/**
 * Persist updated shipping configuration in DB.
 */
export async function updateShippingSettings(
  settings: Partial<ShippingSettings>
): Promise<ShippingSettings> {
  const current = await getShippingSettings();
  const updated: ShippingSettings = {
    ...current,
    ...settings,
    freeDeliveryThreshold:
      settings.freeDeliveryThreshold !== undefined
        ? Math.max(0, Number(settings.freeDeliveryThreshold))
        : current.freeDeliveryThreshold,
    standardDeliveryFee:
      settings.standardDeliveryFee !== undefined
        ? Math.max(0, Number(settings.standardDeliveryFee))
        : current.standardDeliveryFee,
    enableFreeDelivery:
      settings.enableFreeDelivery !== undefined
        ? Boolean(settings.enableFreeDelivery)
        : current.enableFreeDelivery,
    estimatedDeliveryDays:
      settings.estimatedDeliveryDays?.trim() || current.estimatedDeliveryDays,
  };

  const records = await db.orm.public.IntegrationConnection.where({
    provider: 'shipping',
  }).all();

  if (records.length > 0) {
    await db.orm.public.IntegrationConnection.where({ id: records[0].id }).update({
      config: updated as any,
      status: 'CONNECTED',
      updatedAt: new Date().toISOString(),
    });
  } else {
    await db.orm.public.IntegrationConnection.create({
      id: generateId(),
      provider: 'shipping',
      status: 'CONNECTED',
      config: updated as any,
    });
  }

  return updated;
}
