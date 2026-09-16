'use client';

import React, { useState, useEffect } from 'react';
import { UserAddress } from '@/lib/types/address';

interface AddressModalProps {
  isOpen: boolean;
  editingAddress: UserAddress | null;
  defaultRecipientName: string;
  defaultRecipientPhone: string;
  onClose: () => void;
  onSave: (addressData: Omit<UserAddress, 'id'>, editId?: string) => Promise<boolean>;
}

export function AddressModal({
  isOpen,
  editingAddress,
  defaultRecipientName,
  defaultRecipientPhone,
  onClose,
  onSave,
}: AddressModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editingAddress) {
      setName(editingAddress.name);
      setPhone(editingAddress.phone);
      setLine1(editingAddress.line1);
      setLine2(editingAddress.line2 || '');
      setCity(editingAddress.city);
      setState(editingAddress.state);
      setPincode(editingAddress.pincode);
      setIsDefault(!!editingAddress.isDefault);
    } else {
      setName(defaultRecipientName || '');
      setPhone(defaultRecipientPhone || '');
      setLine1('');
      setLine2('');
      setCity('');
      setState('');
      setPincode('');
      setIsDefault(false);
    }
    setErrorMsg(null);
  }, [editingAddress, defaultRecipientName, defaultRecipientPhone, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !line1.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
      setErrorMsg('Please complete all required address fields.');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const success = await onSave(
      {
        name: name.trim(),
        phone: phone.trim(),
        line1: line1.trim(),
        line2: line2.trim() || undefined,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        country: 'India',
        isDefault,
      },
      editingAddress?.id
    );

    setSaving(false);
    if (success) {
      onClose();
    } else {
      setErrorMsg('Failed to save address.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onWheel={(e) => e.stopPropagation()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg border border-hairline bg-bg-primary text-text-ondark shadow-2xl p-6 rounded-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="border-b border-hairline pb-4 mb-5">
          <h3 className="font-serif text-xl font-light text-text-ondark">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h3>
          <p className="text-xs text-text-ondark/60 font-light mt-0.5">
            Saved addresses can be selected directly on checkout.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 bg-red-950/40 border border-red-500/40 text-red-300 text-xs rounded">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                Recipient Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ananya Sharma"
                className="w-full border border-hairline bg-bg-deep px-3 py-2 text-xs text-text-ondark focus:border-accent-brass focus:outline-none rounded"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                Contact Phone *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full border border-hairline bg-bg-deep px-3 py-2 text-xs text-text-ondark focus:border-accent-brass focus:outline-none rounded font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
              Street Address / Flat / Building *
            </label>
            <input
              type="text"
              required
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              placeholder="e.g. Flat 402, Lotus Grand, 14th Main Road"
              className="w-full border border-hairline bg-bg-deep px-3 py-2 text-xs text-text-ondark focus:border-accent-brass focus:outline-none rounded"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
              Apartment / Area / Landmark (Optional)
            </label>
            <input
              type="text"
              value={line2}
              onChange={(e) => setLine2(e.target.value)}
              placeholder="e.g. Near Defense Colony Park"
              className="w-full border border-hairline bg-bg-deep px-3 py-2 text-xs text-text-ondark focus:border-accent-brass focus:outline-none rounded"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                City *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai"
                className="w-full border border-hairline bg-bg-deep px-3 py-2 text-xs text-text-ondark focus:border-accent-brass focus:outline-none rounded"
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
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Maharashtra"
                className="w-full border border-hairline bg-bg-deep px-3 py-2 text-xs text-text-ondark focus:border-accent-brass focus:outline-none rounded"
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
                onChange={(e) => setPincode(e.target.value)}
                placeholder="400001"
                className="w-full border border-hairline bg-bg-deep px-3 py-2 text-xs text-text-ondark focus:border-accent-brass focus:outline-none rounded font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="default-check"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded border-hairline text-accent-brass focus:ring-accent-brass"
            />
            <label htmlFor="default-check" className="text-xs text-text-ondark/80 cursor-pointer">
              Set as default delivery address
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-hairline">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-hairline text-xs uppercase tracking-wider text-text-ondark/70 hover:border-text-ondark rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-accent-brass text-bg-primary hover:bg-accent-brass-hover px-6 py-2 text-xs uppercase tracking-wider font-medium rounded shadow-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
