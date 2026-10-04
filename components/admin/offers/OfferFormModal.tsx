'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, Percent, Calendar, Check, Tag } from 'lucide-react';
import { OfferCoupon } from '@/lib/db/offers';
import { toast } from '@/lib/store/useToast';

interface OfferFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialOffer?: OfferCoupon | null;
}

const PERCENT_PRESETS = [10, 15, 20, 25, 30, 50];

export function OfferFormModal({
  isOpen,
  onClose,
  onSaved,
  initialOffer,
}: OfferFormModalProps) {
  const isEdit = !!initialOffer;

  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(15);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [minOrderValue, setMinOrderValue] = useState<number | ''>(0);
  const [maxDiscount, setMaxDiscount] = useState<number | ''>('');
  const [isActive, setIsActive] = useState(true);
  const [expiresAt, setExpiresAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (initialOffer) {
      setCode(initialOffer.code);
      setDiscountPercent(initialOffer.discountPercent);
      setTitle(initialOffer.title);
      setDescription(initialOffer.description || '');
      setMinOrderValue(initialOffer.minOrderValue ?? 0);
      setMaxDiscount(initialOffer.maxDiscount ?? '');
      setIsActive(initialOffer.isActive);
      setExpiresAt(
        initialOffer.expiresAt
          ? new Date(initialOffer.expiresAt).toISOString().split('T')[0]
          : ''
      );
    } else {
      setCode('');
      setDiscountPercent(15);
      setTitle('');
      setDescription('');
      setMinOrderValue(0);
      setMaxDiscount('');
      setIsActive(true);
      setExpiresAt('');
    }
    setErrorMsg(null);
  }, [initialOffer, isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim() || discountPercent <= 0) {
      setErrorMsg('Please provide a valid code, discount percentage, and title.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        code: code.trim().toUpperCase(),
        discountPercent: Number(discountPercent),
        title: title.trim(),
        description: description.trim(),
        minOrderValue: minOrderValue === '' ? 0 : Number(minOrderValue),
        maxDiscount: maxDiscount === '' ? null : Number(maxDiscount),
        isActive,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      };

      const url = isEdit
        ? `/api/admin/offers/${initialOffer.id}`
        : '/api/admin/offers';
      const method = isEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save offer');

      toast.success(
        isEdit ? `Offer "${payload.code}" updated` : `Offer code "${payload.code}" created`,
        isEdit ? 'Offer Updated' : 'Offer Created'
      );

      onSaved();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving offer');
      toast.error(err.message || 'Error saving offer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md"
      onWheel={(e) => e.stopPropagation()}
    >
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl max-h-[92vh] flex flex-col border border-hairline bg-bg-primary text-text-ondark shadow-2xl rounded-sm overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4 shrink-0 bg-bg-primary z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-accent-brass/10 text-accent-brass border border-accent-brass/20">
              <Tag size={16} />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium">
                Promotion & Discount Engine
              </span>
              <h2 className="font-serif text-lg sm:text-xl font-light text-text-ondark">
                {isEdit ? `Edit Offer: ${initialOffer.code}` : 'Create New Discount Offer'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-ondark/60 hover:text-accent-brass transition-colors p-1.5 rounded-sm hover:bg-bg-deep"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="border border-red-500/40 bg-red-950/20 p-3 text-xs text-red-300 flex items-center gap-2 rounded-sm">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Code & Percentage Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                Offer Code *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ''))}
                  placeholder="e.g. FESTIVE20"
                  className="w-full border border-hairline bg-bg-deep px-3 py-2.5 text-sm font-mono uppercase tracking-wider text-accent-brass placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none"
                />
              </div>
              <p className="text-[10px] text-text-ondark/40">
                Customers enter this code at checkout to apply discount.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                Discount Percentage (%) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Math.min(100, Math.max(1, Number(e.target.value))))}
                  placeholder="20"
                  className="w-full border border-hairline bg-bg-deep px-3 py-2.5 text-sm font-mono text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-text-ondark/40">
                  % OFF
                </span>
              </div>
              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1 pt-1">
                {PERCENT_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setDiscountPercent(p)}
                    className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                      discountPercent === p
                        ? 'bg-accent-brass/20 border-accent-brass text-accent-brass'
                        : 'border-hairline text-text-ondark/50 hover:border-text-ondark/30 hover:text-text-ondark'
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
              Offer Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Festive Luxe Privilege"
              className="w-full border border-hairline bg-bg-deep px-3 py-2 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Enjoy 20% discount on all handwoven artisanal apparel and living collections."
              className="w-full border border-hairline bg-bg-deep px-3 py-2 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none"
            />
          </div>

          {/* Conditions Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                Minimum Order Value (₹)
              </label>
              <input
                type="number"
                min="0"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0 (No minimum)"
                className="w-full border border-hairline bg-bg-deep px-3 py-2 text-xs font-mono text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none"
              />
              <p className="text-[10px] text-text-ondark/40">
                0 means valid on any order size.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                Max Discount Cap (₹ Optional)
              </label>
              <input
                type="number"
                min="0"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Leave blank for no limit"
                className="w-full border border-hairline bg-bg-deep px-3 py-2 text-xs font-mono text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none"
              />
              <p className="text-[10px] text-text-ondark/40">
                Limits maximum discount savings per order.
              </p>
            </div>
          </div>

          {/* Expiry Date & Active Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-hairline/60">
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full border border-hairline bg-bg-deep px-3 py-2 text-xs text-text-ondark focus:border-accent-brass focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 flex flex-col justify-center">
              <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                Offer Status
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="accent-accent-brass w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-text-ondark font-medium">
                  {isActive ? (
                    <span className="text-emerald-400">Active (Accepting Redemptions)</span>
                  ) : (
                    <span className="text-text-ondark/50">Disabled (Inactive)</span>
                  )}
                </span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-hairline pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs border border-hairline text-text-ondark/70 hover:text-text-ondark hover:bg-bg-deep transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs bg-accent-brass text-bg-deep font-medium hover:bg-accent-brass-hover transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting ? (
                <>Saving...</>
              ) : (
                <>
                  <Check size={14} />
                  {isEdit ? 'Update Offer' : 'Publish Offer Code'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
