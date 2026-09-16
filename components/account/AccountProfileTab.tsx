'use client';

import React, { useState } from 'react';
import { Edit2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from '@/lib/store/useToast';

interface AccountProfileTabProps {
  fullName: string;
  phone: string;
  userEmail: string;
  onUpdateProfile: (name: string, phone: string) => Promise<boolean>;
}

export function AccountProfileTab({
  fullName: initialFullName,
  phone: initialPhone,
  userEmail,
  onUpdateProfile,
}: AccountProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialFullName);
  const [phoneVal, setPhoneVal] = useState(initialPhone);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    const success = await onUpdateProfile(name, phoneVal);
    setSaving(false);
    if (success) {
      setIsEditing(false);
      toast.success('Your personal details have been updated.', 'Profile Updated');
    } else {
      setErrorMsg('Failed to update profile details.');
    }
  };

  return (
    <div className="border border-hairline bg-bg-deep p-6 sm:p-8 rounded-lg space-y-6">
      {errorMsg && (
        <div className="p-3 bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 rounded">
          <AlertCircle size={15} />
          <span>{errorMsg}</span>
        </div>
      )}

      {!isEditing ? (
        /* Read-only Information View */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-hairline/60 pb-4 gap-4">
            <div>
              <h3 className="font-serif text-xl text-text-ondark font-light">
                Personal Information
              </h3>
              <p className="text-xs text-text-ondark/60 font-light mt-0.5">
                Your verified identity and contact details.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                setErrorMsg(null);
              }}
              className="px-4 py-2 border border-hairline hover:border-accent-brass hover:text-accent-brass text-xs uppercase tracking-wider rounded transition-colors inline-flex items-center gap-2 font-medium"
            >
              <Edit2 size={13} />
              <span>Edit Details</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="p-4 border border-hairline/60 bg-bg-primary/50 rounded-lg space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-text-ondark/50 block">
                Full Name
              </span>
              <p className="text-sm font-serif text-text-ondark font-normal">
                {initialFullName || 'Not provided'}
              </p>
            </div>

            <div className="p-4 border border-hairline/60 bg-bg-primary/50 rounded-lg space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-text-ondark/50 block">
                Email Address
              </span>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-mono text-text-ondark truncate">
                  {userEmail}
                </p>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-[9px] uppercase tracking-wider text-emerald-400 rounded">
                  Verified
                </span>
              </div>
            </div>

            <div className="p-4 border border-hairline/60 bg-bg-primary/50 rounded-lg space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-text-ondark/50 block">
                Phone Number
              </span>
              <p className="text-sm font-mono text-text-ondark">
                {initialPhone || 'Not provided'}
              </p>
            </div>

            <div className="p-4 border border-hairline/60 bg-bg-primary/50 rounded-lg space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-text-ondark/50 block">
                Patron Status
              </span>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent-brass animate-pulse" />
                <p className="text-xs uppercase tracking-wider text-accent-brass font-medium">
                  Active Member
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Edit Mode Form */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-hairline/60 pb-4 gap-4">
            <div>
              <h3 className="font-serif text-xl text-text-ondark font-light">
                Edit Personal Details
              </h3>
              <p className="text-xs text-text-ondark/60 font-light mt-0.5">
                Update your name and primary contact details.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setErrorMsg(null);
              }}
              className="px-4 py-2 text-xs text-text-ondark/60 hover:text-text-ondark transition-colors"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full border border-hairline bg-bg-primary px-3.5 py-2.5 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none rounded"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneVal}
                  onChange={(e) => setPhoneVal(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full border border-hairline bg-bg-primary px-3.5 py-2.5 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none rounded font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={userEmail}
                className="w-full border border-hairline bg-bg-primary/50 px-3.5 py-2.5 text-xs text-text-ondark/60 font-mono rounded cursor-not-allowed"
              />
              <p className="text-[10px] text-text-ondark/40">
                Email address is linked to your authentication credentials.
              </p>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-accent-brass text-bg-primary hover:bg-accent-brass-hover px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-medium transition-colors rounded-md shadow-sm disabled:opacity-50 inline-flex items-center gap-2"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setErrorMsg(null);
                }}
                className="px-5 py-2.5 border border-hairline text-text-ondark/70 hover:text-text-ondark text-xs uppercase tracking-wider rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
