'use client';

import React from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { UserAddress } from '@/lib/types/address';

interface CheckoutAddressSectionProps {
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  savedAddresses: UserAddress[];
  selectedAddressId: string | null;
  onLine1Change: (val: string) => void;
  onLine2Change: (val: string) => void;
  onCityChange: (val: string) => void;
  onStateChange: (val: string) => void;
  onPincodeChange: (val: string) => void;
  onSelectAddress: (addr: UserAddress) => void;
  onClearAddressSelection: () => void;
}

export function CheckoutAddressSection({
  line1,
  line2,
  city,
  state,
  pincode,
  savedAddresses,
  selectedAddressId,
  onLine1Change,
  onLine2Change,
  onCityChange,
  onStateChange,
  onPincodeChange,
  onSelectAddress,
  onClearAddressSelection,
}: CheckoutAddressSectionProps) {
  return (
    <div className="space-y-4 pt-4 border-t border-hairline">
      <div className="flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-[0.2em] text-accent-brass font-medium">
          Shipping Address
        </h3>
        {savedAddresses.length > 0 && (
          <Link
            href="/account"
            target="_blank"
            className="text-[10px] text-accent-brass/80 hover:text-accent-brass transition-colors underline underline-offset-4"
          >
            Manage Addresses
          </Link>
        )}
      </div>

      {savedAddresses.length > 0 && (
        <div className="space-y-2 mb-4">
          <p className="text-[11px] text-text-ondark/60 font-light">
            Choose from your saved addresses:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedAddresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id;
              return (
                <div
                  key={addr.id}
                  onClick={() => onSelectAddress(addr)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all relative ${
                    isSelected
                      ? 'border-accent-brass bg-accent-brass/10 ring-1 ring-accent-brass shadow-sm'
                      : 'border-hairline bg-bg-deep/70 hover:border-text-ondark/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-accent-brass">
                      {addr.tag || 'Saved'}
                    </span>
                    {isSelected ? (
                      <span className="flex items-center gap-1 text-[10px] text-accent-brass font-medium">
                        <Check size={12} /> Selected
                      </span>
                    ) : (
                      addr.isDefault && (
                        <span className="text-[9px] uppercase tracking-wider text-text-ondark/40">
                          Default
                        </span>
                      )
                    )}
                  </div>
                  <p className="text-xs font-medium text-text-ondark truncate">{addr.name}</p>
                  <p className="text-[11px] text-text-ondark/70 mt-0.5 line-clamp-2 leading-relaxed">
                    {addr.line1}
                    {addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  {addr.phone && (
                    <p className="text-[10px] text-text-ondark/50 mt-1 font-mono">{addr.phone}</p>
                  )}
                </div>
              );
            })}
          </div>
          {selectedAddressId && (
            <button
              type="button"
              onClick={onClearAddressSelection}
              className="text-[11px] text-accent-brass hover:underline pt-1"
            >
              + Or enter a different shipping address below
            </button>
          )}
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
          Address Line 1 *
        </label>
        <input
          type="text"
          required
          value={line1}
          onChange={(e) => onLine1Change(e.target.value)}
          placeholder="House / Apartment no., Street"
          className="w-full border border-hairline bg-bg-deep px-4 py-3 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none transition-colors rounded-md"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
          Address Line 2 (Optional)
        </label>
        <input
          type="text"
          value={line2}
          onChange={(e) => onLine2Change(e.target.value)}
          placeholder="Landmark, Area"
          className="w-full border border-hairline bg-bg-deep px-4 py-3 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none transition-colors rounded-md"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
            City *
          </label>
          <input
            type="text"
            required
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            placeholder="Chennai"
            className="w-full border border-hairline bg-bg-deep px-4 py-3 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none transition-colors rounded-md"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
            State *
          </label>
          <input
            type="text"
            required
            value={state}
            onChange={(e) => onStateChange(e.target.value)}
            placeholder="Tamil Nadu"
            className="w-full border border-hairline bg-bg-deep px-4 py-3 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none transition-colors rounded-md"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
            PIN Code *
          </label>
          <input
            type="text"
            required
            value={pincode}
            onChange={(e) => onPincodeChange(e.target.value)}
            placeholder="600018"
            className="w-full border border-hairline bg-bg-deep px-4 py-3 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none transition-colors rounded-md"
          />
        </div>
      </div>
    </div>
  );
}
