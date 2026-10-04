'use client';

import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Percent,
  TrendingUp,
  Check,
  Copy,
  Edit2,
  Trash2,
  Power,
  Search,
  Sparkles,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { OfferCoupon } from '@/lib/db/offers';
import { OfferFormModal } from './OfferFormModal';
import { toast } from '@/lib/store/useToast';
import { brandConfig } from '@/config/brand.config';

interface AdminOffersClientProps {
  initialOffers: OfferCoupon[];
}

export function AdminOffersClient({ initialOffers }: AdminOffersClientProps) {
  const [offers, setOffers] = useState<OfferCoupon[]>(initialOffers);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferCoupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchOffers = async () => {
    try {
      const res = await fetch('/api/admin/offers');
      const data = await res.json();
      if (res.ok && Array.isArray(data.offers)) {
        setOffers(data.offers);
      }
    } catch (e) {
      console.warn('Could not reload offers:', e);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.info(`Promo code "${code}" copied to clipboard`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleStatus = async (offer: OfferCoupon) => {
    setTogglingId(offer.id);
    try {
      const newStatus = !offer.isActive;
      const res = await fetch(`/api/admin/offers/${offer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      setOffers((prev) =>
        prev.map((o) => (o.id === offer.id ? { ...o, isActive: newStatus } : o))
      );
      toast.success(
        `Offer code "${offer.code}" is now ${newStatus ? 'Active' : 'Inactive'}`
      );
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle status');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteOffer = async (offer: OfferCoupon) => {
    if (!confirm(`Are you sure you want to delete offer "${offer.code}"?`)) return;

    try {
      const res = await fetch(`/api/admin/offers/${offer.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete offer');

      setOffers((prev) => prev.filter((o) => o.id !== offer.id));
      toast.success(`Offer code "${offer.code}" deleted`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete offer');
    }
  };

  const filteredOffers = offers.filter((o) => {
    const matchesSearch =
      o.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'ALL' ||
      (filterStatus === 'ACTIVE' && o.isActive) ||
      (filterStatus === 'INACTIVE' && !o.isActive);

    return matchesSearch && matchesStatus;
  });

  const activeCount = offers.filter((o) => o.isActive).length;
  const maxDiscountVal = offers.length > 0 ? Math.max(...offers.map((o) => o.discountPercent)) : 0;
  const totalRedemptions = offers.reduce((sum, o) => sum + (o.usageCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline pb-5">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium">
            Promotions & Campaigns
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-light text-text-ondark">
            Offers & Discount Codes
          </h1>
          <p className="text-xs text-text-ondark/60 font-light mt-1">
            Configure percentage discount codes applicable across all store products.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingOffer(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-brass text-bg-deep font-medium text-xs tracking-wider uppercase hover:bg-accent-brass-hover transition-colors rounded-sm shadow-md self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>Create New Offer</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 border border-hairline bg-bg-deep/60 rounded-md space-y-1">
          <div className="flex items-center justify-between text-text-ondark/50 text-xs">
            <span>Active Campaigns</span>
            <Tag size={16} className="text-accent-brass" />
          </div>
          <div className="text-2xl font-serif font-light text-text-ondark">
            {activeCount} <span className="text-xs text-text-ondark/40 font-sans">/ {offers.length} total</span>
          </div>
          <p className="text-[10px] text-emerald-400 font-light">
            Ready for customer checkout redemption
          </p>
        </div>

        <div className="p-4 sm:p-5 border border-hairline bg-bg-deep/60 rounded-md space-y-1">
          <div className="flex items-center justify-between text-text-ondark/50 text-xs">
            <span>Highest Discount</span>
            <Percent size={16} className="text-accent-brass" />
          </div>
          <div className="text-2xl font-serif font-light text-accent-brass">
            {maxDiscountVal}% OFF
          </div>
          <p className="text-[10px] text-text-ondark/40 font-light">
            Applied site-wide on eligible carts
          </p>
        </div>

        <div className="p-4 sm:p-5 border border-hairline bg-bg-deep/60 rounded-md space-y-1">
          <div className="flex items-center justify-between text-text-ondark/50 text-xs">
            <span>Total Redemptions</span>
            <TrendingUp size={16} className="text-accent-brass" />
          </div>
          <div className="text-2xl font-serif font-light text-text-ondark">
            {totalRedemptions}
          </div>
          <p className="text-[10px] text-text-ondark/40 font-light">
            Orders placed using promo codes
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 border border-hairline bg-bg-primary rounded-md">
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-ondark/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code or title..."
            className="w-full bg-bg-deep border border-hairline pl-9 pr-3 py-1.5 text-xs text-text-ondark placeholder-text-ondark/40 focus:border-accent-brass focus:outline-none rounded"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-[11px] font-medium tracking-wider uppercase rounded transition-colors ${
                filterStatus === st
                  ? 'bg-accent-brass/20 text-accent-brass border border-accent-brass/40'
                  : 'text-text-ondark/50 hover:text-text-ondark border border-transparent'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Offers Table */}
      <div className="border border-hairline bg-bg-primary rounded-md overflow-hidden shadow-lg">
        {filteredOffers.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <div className="inline-flex p-3 rounded-full bg-accent-brass/10 text-accent-brass border border-accent-brass/20">
              <Tag size={24} />
            </div>
            <h3 className="font-serif text-lg font-light text-text-ondark">
              No offer codes found
            </h3>
            <p className="text-xs text-text-ondark/50 max-w-sm mx-auto font-light">
              Create your first percentage discount offer to boost checkout conversion across the store.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingOffer(null);
                setIsModalOpen(true);
              }}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-accent-brass text-bg-deep text-xs font-medium uppercase tracking-wider hover:bg-accent-brass-hover transition-colors"
            >
              <Plus size={14} /> Create Offer
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-hairline bg-bg-deep/70 text-[10px] uppercase tracking-wider text-text-ondark/60 font-medium">
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Discount</th>
                  <th className="py-3.5 px-4">Offer Title & Terms</th>
                  <th className="py-3.5 px-4">Usage</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filteredOffers.map((offer) => (
                  <tr
                    key={offer.id}
                    className="hover:bg-bg-deep/40 transition-colors group"
                  >
                    {/* Code */}
                    <td className="py-4 px-4 font-mono font-medium">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded bg-accent-brass/15 border border-accent-brass/30 text-accent-brass text-xs font-bold tracking-wider">
                          {offer.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(offer.code)}
                          className="text-text-ondark/40 hover:text-accent-brass transition-colors p-1"
                          title="Copy Code"
                        >
                          {copiedCode === offer.code ? (
                            <Check size={13} className="text-emerald-400" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Discount */}
                    <td className="py-4 px-4 font-mono">
                      <span className="text-sm font-semibold text-text-ondark">
                        {offer.discountPercent}%
                      </span>
                      <span className="text-[10px] text-accent-brass ml-1 font-light">
                        OFF
                      </span>
                    </td>

                    {/* Title & Terms */}
                    <td className="py-4 px-4 max-w-xs">
                      <p className="font-medium text-text-ondark truncate">
                        {offer.title}
                      </p>
                      <p className="text-[11px] text-text-ondark/50 font-light truncate">
                        {offer.description || (
                          offer.minOrderValue && offer.minOrderValue > 0
                            ? `Min order: ₹${offer.minOrderValue.toLocaleString('en-IN')}`
                            : 'Valid on all cart values'
                        )}
                      </p>
                      {offer.expiresAt && (
                        <span className="text-[10px] text-text-ondark/40 flex items-center gap-1 mt-0.5">
                          <Calendar size={10} />
                          Expires: {new Date(offer.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                    </td>

                    {/* Usage */}
                    <td className="py-4 px-4 font-mono text-text-ondark/70">
                      {offer.usageCount || 0} orders
                    </td>

                    {/* Status Toggle */}
                    <td className="py-4 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(offer)}
                        disabled={togglingId === offer.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${
                          offer.isActive
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/70'
                            : 'bg-zinc-900 text-text-ondark/40 border-hairline hover:text-text-ondark/70'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            offer.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'
                          }`}
                        />
                        <span>{offer.isActive ? 'Active' : 'Disabled'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingOffer(offer);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 text-text-ondark/50 hover:text-accent-brass hover:bg-bg-deep rounded transition-colors"
                        title="Edit Offer"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteOffer(offer)}
                        className="p-1.5 text-text-ondark/50 hover:text-rose-400 hover:bg-rose-950/20 rounded transition-colors"
                        title="Delete Offer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Offer Form Modal */}
      <OfferFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchOffers}
        initialOffer={editingOffer}
      />
    </div>
  );
}
