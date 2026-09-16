'use client';

import React, { useState } from 'react';
import {
  Truck,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Store,
  ShieldCheck,
  RefreshCw,
  Info,
} from 'lucide-react';
import { ShippingSettings } from '@/lib/db/settings';
import { brandConfig } from '@/config/brand.config';
import { toast } from '@/lib/store/useToast';

interface AdminSettingsClientProps {
  initialShipping: ShippingSettings;
}

export function AdminSettingsClient({ initialShipping }: AdminSettingsClientProps) {
  const [shipping, setShipping] = useState<ShippingSettings>(initialShipping);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shipping }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to update shipping settings');
      }

      setShipping(data.shipping);
      toast.success('Free delivery threshold & shipping settings successfully updated!', {
        title: 'Settings Saved',
      });
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while updating settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <form onSubmit={handleSave} className="space-y-8">
        {/* Delivery & Free Shipping Rules */}
        <div className="border border-hairline bg-bg-deep p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded border border-accent-brass/30 bg-accent-brass/10 text-accent-brass">
                <Truck size={20} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-light text-text-ondark">
                  Fulfillment & Delivery Policy
                </h3>
                <p className="text-xs text-text-ondark/50 font-light mt-0.5">
                  Configure minimum order amount for free delivery and standard shipping rates.
                </p>
              </div>
            </div>

            {/* Live Indicator Pill */}
            <div className="flex items-center gap-2 px-3 py-1 border border-accent-brass/30 bg-accent-brass/5 self-start sm:self-auto">
              <Sparkles size={12} className="text-accent-brass" />
              <span className="text-[11px] text-accent-brass font-medium">
                {shipping.enableFreeDelivery
                  ? `Free shipping ≥ ₹${shipping.freeDeliveryThreshold.toLocaleString('en-IN')}`
                  : 'Free shipping disabled'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free Delivery Threshold */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-text-ondark uppercase tracking-wider">
                Free Delivery Order Minimum (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-accent-brass text-sm font-serif">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  required
                  value={shipping.freeDeliveryThreshold}
                  onChange={(e) =>
                    setShipping((prev) => ({
                      ...prev,
                      freeDeliveryThreshold: Number(e.target.value),
                    }))
                  }
                  className="w-full bg-bg-primary border border-hairline pl-8 pr-4 py-2.5 text-sm text-text-ondark font-mono focus:outline-none focus:border-accent-brass transition-colors"
                  placeholder="e.g. 2000"
                />
              </div>
              <p className="text-[11px] text-text-ondark/40 font-light">
                Orders with a subtotal equal to or exceeding this price receive 100% complimentary delivery.
              </p>
            </div>

            {/* Standard Delivery Charge */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-text-ondark uppercase tracking-wider">
                Standard Delivery Cost (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-accent-brass text-sm font-serif">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  required
                  value={shipping.standardDeliveryFee}
                  onChange={(e) =>
                    setShipping((prev) => ({
                      ...prev,
                      standardDeliveryFee: Number(e.target.value),
                    }))
                  }
                  className="w-full bg-bg-primary border border-hairline pl-8 pr-4 py-2.5 text-sm text-text-ondark font-mono focus:outline-none focus:border-accent-brass transition-colors"
                  placeholder="e.g. 150"
                />
              </div>
              <p className="text-[11px] text-text-ondark/40 font-light">
                Fee charged at checkout when customer cart subtotal is below the free delivery threshold.
              </p>
            </div>

            {/* Estimated Delivery Timeline */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-text-ondark uppercase tracking-wider">
                Estimated Delivery Window
              </label>
              <input
                type="text"
                value={shipping.estimatedDeliveryDays}
                onChange={(e) =>
                  setShipping((prev) => ({
                    ...prev,
                    estimatedDeliveryDays: e.target.value,
                  }))
                }
                className="w-full bg-bg-primary border border-hairline px-4 py-2.5 text-xs text-text-ondark focus:outline-none focus:border-accent-brass transition-colors"
                placeholder="e.g. 3-5 Business Days"
              />
              <p className="text-[11px] text-text-ondark/40 font-light">
                Displayed in the checkout bag and concierge policy assistant.
              </p>
            </div>

            {/* Enable/Disable Free Shipping Rule */}
            <div className="space-y-2 flex flex-col justify-between">
              <label className="block text-xs font-medium text-text-ondark uppercase tracking-wider">
                Free Delivery Promotion Status
              </label>
              <div className="p-3 border border-hairline bg-bg-primary/60 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs text-text-ondark font-medium block">
                    {shipping.enableFreeDelivery ? 'Rule Active' : 'Rule Inactive'}
                  </span>
                  <span className="text-[11px] text-text-ondark/40">
                    {shipping.enableFreeDelivery
                      ? 'Free shipping threshold is actively enforced at checkout.'
                      : 'All orders will incur standard shipping fee regardless of subtotal.'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setShipping((prev) => ({
                      ...prev,
                      enableFreeDelivery: !prev.enableFreeDelivery,
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    shipping.enableFreeDelivery ? 'bg-accent-brass' : 'bg-hairline'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-bg-deep shadow ring-0 transition duration-200 ease-in-out ${
                      shipping.enableFreeDelivery ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Policy Information Box */}
          <div className="p-4 border border-accent-brass/20 bg-accent-brass/5 flex items-start gap-3 text-xs text-text-ondark/70">
            <Info size={16} className="text-accent-brass shrink-0 mt-0.5" />
            <p className="font-light leading-relaxed">
              Updates take effect immediately on all new customer carts, the Cart Drawer free shipping progress meter, and the Checkout calculation.
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex justify-end pt-4 border-t border-hairline">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 bg-accent-brass text-bg-deep px-6 py-2.5 text-xs uppercase tracking-widest font-medium hover:bg-accent-brass/90 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isSaving ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Saving Settings...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save Shipping Settings</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Store Brand & Contact Information (Read-Only Overview) */}
        <div className="border border-hairline bg-bg-deep p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-hairline pb-4">
            <div className="p-2.5 rounded border border-hairline bg-bg-primary text-text-ondark/70">
              <Store size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-light text-text-ondark">
                Maison Identity & Regional Currency
              </h3>
              <p className="text-xs text-text-ondark/50 font-light mt-0.5">
                Core brand parameters configured across the platform.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs">
            <div className="space-y-1 p-3 bg-bg-primary/40 border border-hairline">
              <span className="text-[10px] uppercase tracking-wider text-accent-brass block">
                Brand Name
              </span>
              <p className="text-text-ondark font-serif text-sm">{brandConfig.name}</p>
            </div>
            <div className="space-y-1 p-3 bg-bg-primary/40 border border-hairline">
              <span className="text-[10px] uppercase tracking-wider text-accent-brass block">
                Active Currency
              </span>
              <p className="text-text-ondark font-mono">
                {brandConfig.currency.code} ({brandConfig.currency.symbol})
              </p>
            </div>
            <div className="space-y-1 p-3 bg-bg-primary/40 border border-hairline">
              <span className="text-[10px] uppercase tracking-wider text-accent-brass block">
                Atelier Inquiries
              </span>
              <p className="text-text-ondark truncate">{brandConfig.contact.email}</p>
            </div>
            <div className="space-y-1 p-3 bg-bg-primary/40 border border-hairline">
              <span className="text-[10px] uppercase tracking-wider text-accent-brass block">
                Concierge Phone
              </span>
              <p className="text-text-ondark">{brandConfig.contact.phone}</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
