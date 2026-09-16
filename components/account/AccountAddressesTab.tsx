'use client';

import React, { useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserAddress } from '@/lib/types/address';
import { AddressModal } from './AddressModal';
import { toast } from '@/lib/store/useToast';

interface AccountAddressesTabProps {
  addresses: UserAddress[];
  defaultRecipientName: string;
  defaultRecipientPhone: string;
  onSaveAddress: (addressData: Omit<UserAddress, 'id'>, editId?: string) => Promise<boolean>;
  onDeleteAddress: (id: string) => Promise<boolean>;
  onSetDefaultAddress: (id: string) => Promise<boolean>;
}

export function AccountAddressesTab({
  addresses,
  defaultRecipientName,
  defaultRecipientPhone,
  onSaveAddress,
  onDeleteAddress,
  onSetDefaultAddress,
}: AccountAddressesTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setShowModal(true);
  };

  const handleOpenEdit = (addr: UserAddress) => {
    setEditingAddress(addr);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this address?')) return;
    const ok = await onDeleteAddress(id);
    if (ok) {
      toast.success('Address removed successfully.', 'Address Removed');
    }
  };

  const handleSetDefault = async (id: string) => {
    const ok = await onSetDefaultAddress(id);
    if (ok) {
      toast.success('Default delivery address updated.', 'Default Address');
    }
  };

  return (
    <div className="border border-hairline bg-bg-deep p-6 sm:p-8 rounded-lg space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-hairline/60 pb-4 gap-4">
        <div>
          <h3 className="font-serif text-xl text-text-ondark font-light">
            Saved Shipping Addresses
          </h3>
          <p className="text-xs text-text-ondark/60 font-light mt-0.5">
            Manage delivery destinations. These addresses can be selected with one click during checkout.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="bg-accent-brass text-bg-primary hover:bg-accent-brass-hover px-4 py-2 text-xs uppercase tracking-wider font-medium transition-colors rounded-md inline-flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <Plus size={14} />
          <span>Add New Address</span>
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="py-16 text-center space-y-4">
          <div className="h-12 w-12 mx-auto rounded-full bg-bg-primary border border-hairline flex items-center justify-center text-accent-brass/60">
            <MapPin size={22} />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h4 className="font-serif text-lg text-text-ondark font-light">
              No Addresses Saved Yet
            </h4>
            <p className="text-xs text-text-ondark/60 font-light">
              Add a shipping address to enjoy accelerated, 1-click checkout on your next acquisition.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 bg-accent-brass px-5 py-2.5 text-xs uppercase tracking-[0.15em] font-medium text-bg-primary hover:bg-accent-brass-hover transition-colors rounded-md shadow-sm mt-2"
          >
            <Plus size={14} />
            <span>Add Address</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-5 rounded-lg border transition-all relative flex flex-col justify-between ${
                addr.isDefault
                  ? 'border-accent-brass/60 bg-accent-brass/5 shadow-sm'
                  : 'border-hairline bg-bg-primary'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-ondark">
                    {addr.name}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-accent-brass text-bg-primary font-semibold">
                      Default
                    </span>
                  )}
                </div>

                <div className="text-xs text-text-ondark/75 font-light leading-relaxed space-y-0.5">
                  <p>{addr.line1}</p>
                  {addr.line2 && <p>{addr.line2}</p>}
                  <p>
                    {addr.city}, {addr.state} — <span className="font-mono">{addr.pincode}</span>
                  </p>
                  <p>{addr.country || 'India'}</p>
                  <p className="font-mono text-[11px] text-text-ondark/50 pt-1">
                    Phone: {addr.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-hairline/60">
                <div>
                  {!addr.isDefault && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-[11px] text-accent-brass hover:underline"
                    >
                      Set as Default
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(addr)}
                    className="p-1.5 border border-hairline hover:border-accent-brass hover:text-accent-brass transition-colors rounded"
                    title="Edit Address"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(addr.id)}
                    className="p-1.5 border border-hairline hover:border-red-500 hover:text-red-400 transition-colors rounded"
                    title="Delete Address"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reusable Address Modal */}
      <AddressModal
        isOpen={showModal}
        editingAddress={editingAddress}
        defaultRecipientName={defaultRecipientName}
        defaultRecipientPhone={defaultRecipientPhone}
        onClose={() => setShowModal(false)}
        onSave={onSaveAddress}
      />
    </div>
  );
}
