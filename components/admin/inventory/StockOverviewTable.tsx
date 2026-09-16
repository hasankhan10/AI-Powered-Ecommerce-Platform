'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Plus,
  Minus,
  Check,
  RefreshCw,
  SlidersHorizontal,
  Package,
} from 'lucide-react';
import { VariantInventoryItem } from '@/lib/db/inventory';
import { toast } from '@/lib/store/useToast';

interface StockOverviewTableProps {
  initialVariants: VariantInventoryItem[];
}

export function StockOverviewTable({ initialVariants }: StockOverviewTableProps) {
  const [variants, setVariants] = useState<VariantInventoryItem[]>(initialVariants);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'IN_STOCK'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [threshold, setThreshold] = useState<number>(5);
  const [adjustingId, setAdjustingId] = useState<string | null>(null);

  // Re-calculate dynamic status based on chosen threshold
  const computedVariants = variants.map((v) => {
    let status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
    if (v.stock === 0) {
      status = 'OUT_OF_STOCK';
    } else if (v.stock <= threshold) {
      status = 'LOW_STOCK';
    }
    return { ...v, status };
  });

  const filtered = computedVariants.filter((v) => {
    if (statusFilter !== 'ALL' && v.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = v.productName.toLowerCase().includes(q);
      const matchSku = v.sku.toLowerCase().includes(q);
      const matchColor = (v.color || '').toLowerCase().includes(q);
      const matchSize = (v.size || '').toLowerCase().includes(q);
      return matchName || matchSku || matchColor || matchSize;
    }
    return true;
  });

  const handleAdjustStock = async (variantId: string, delta: number) => {
    setAdjustingId(variantId);
    try {
      const res = await fetch('/api/admin/inventory/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, delta, reason: delta > 0 ? 'RESTOCK' : 'ADJUSTMENT' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || 'Stock adjustment failed');
      }

      setVariants((prev) =>
        prev.map((v) => (v.id === variantId ? { ...v, stock: data.newStock } : v))
      );

      toast.success(
        delta > 0
          ? `Added +${delta} unit${delta === 1 ? '' : 's'} to inventory (New stock: ${data.newStock})`
          : `Adjusted inventory by ${delta} unit${delta === -1 ? '' : 's'} (New stock: ${data.newStock})`,
        {
          title: delta > 0 ? 'Stock Restocked' : 'Inventory Adjusted',
        }
      );
    } catch (err: any) {
      toast.error(err.message || 'Error updating stock');
    } finally {
      setAdjustingId(null);
    }
  };

  const counts = {
    ALL: computedVariants.length,
    LOW_STOCK: computedVariants.filter((v) => v.status === 'LOW_STOCK').length,
    OUT_OF_STOCK: computedVariants.filter((v) => v.status === 'OUT_OF_STOCK').length,
    IN_STOCK: computedVariants.filter((v) => v.status === 'IN_STOCK').length,
  };

  return (
    <div className="border border-hairline bg-bg-deep p-4 sm:p-6 space-y-4 sm:space-y-6 rounded-md shadow-sm">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium block">
            Variant Inventory
          </span>
          <h3 className="font-serif text-lg sm:text-xl font-light text-text-ondark mt-0.5">
            Stock Overview & Runout Status
          </h3>
        </div>

        {/* Configurable Low-Stock Threshold Dropdown */}
        <div className="flex items-center gap-2 border border-hairline bg-bg-primary/50 px-3 py-1.5 text-xs">
          <SlidersHorizontal size={13} className="text-accent-brass" />
          <span className="text-text-ondark/60">Low-Stock Alert:</span>
          <select
            value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value, 10))}
            className="bg-bg-deep border border-hairline text-accent-brass text-xs px-2 py-0.5 focus:outline-none cursor-pointer"
          >
            <option value={3}>≤ 3 units</option>
            <option value={5}>≤ 5 units (Default)</option>
            <option value={8}>≤ 8 units</option>
            <option value={10}>≤ 10 units</option>
          </select>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(['ALL', 'LOW_STOCK', 'OUT_OF_STOCK', 'IN_STOCK'] as const).map((st) => {
            const isActive = statusFilter === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider transition-colors whitespace-nowrap flex items-center gap-2 border ${
                  isActive
                    ? 'border-accent-brass bg-accent-brass/10 text-accent-brass font-medium'
                    : 'border-hairline text-text-ondark/60 hover:text-text-ondark hover:border-text-ondark/30'
                }`}
              >
                <span>{st.replace('_', ' ')}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-accent-brass/20 text-accent-brass' : 'bg-white/5 text-text-ondark/40'
                  }`}
                >
                  {counts[st]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-ondark/40" />
          <input
            type="text"
            placeholder="Search piece, SKU, or color..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-primary/50 border border-hairline pl-9 pr-4 py-1.5 text-xs text-text-ondark placeholder:text-text-ondark/30 focus:outline-none focus:border-accent-brass transition-colors"
          />
        </div>
      </div>

      {/* Variants Table */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center space-y-2">
          <Package size={28} className="text-accent-brass/40 mx-auto" />
          <p className="text-xs text-text-ondark/60 font-light">
            No variants match your filter criteria.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="border-b border-hairline text-[10px] uppercase tracking-wider text-text-ondark/40">
                <th className="pb-3 font-medium">Piece</th>
                <th className="pb-3 font-medium">SKU</th>
                <th className="pb-3 font-medium">Variant</th>
                <th className="pb-3 font-medium">Price</th>
                <th className="pb-3 font-medium text-center">Status</th>
                <th className="pb-3 font-medium text-center">Velocity</th>
                <th className="pb-3 font-medium text-center">Stock</th>
                <th className="pb-3 font-medium text-right">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.map((v) => {
                const isAdjusting = adjustingId === v.id;

                return (
                  <tr key={v.id} className="hover:bg-bg-primary/40 transition-colors">
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-11 bg-bg-primary overflow-hidden border border-hairline shrink-0">
                          {v.image ? (
                            <Image
                              src={v.image}
                              alt={v.productName}
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px] text-text-ondark/30">
                              MV
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/product/${v.productSlug}`}
                            className="font-serif font-light text-text-ondark hover:text-accent-brass transition-colors truncate block"
                          >
                            {v.productName}
                          </Link>
                          <span className="text-[10px] text-text-ondark/40">{v.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 font-mono text-[11px] text-accent-brass">
                      {v.sku}
                    </td>
                    <td className="py-3.5 text-text-ondark/70">
                      {[v.color, v.size].filter(Boolean).join(' / ') || 'Standard'}
                    </td>
                    <td className="py-3.5 font-serif text-text-ondark">
                      ₹{v.price.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase font-mono border ${
                          v.status === 'OUT_OF_STOCK'
                            ? 'border-rose-500/40 text-rose-400 bg-rose-500/10'
                            : v.status === 'LOW_STOCK'
                            ? 'border-amber-500/40 text-amber-400 bg-amber-500/10'
                            : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                        }`}
                      >
                        {v.status === 'OUT_OF_STOCK'
                          ? 'Out of Stock'
                          : v.status === 'LOW_STOCK'
                          ? 'Low Stock'
                          : 'In Stock'}
                      </span>
                    </td>
                    <td className="py-3.5 text-center text-text-ondark/60 font-mono text-[11px]">
                      {v.dailyVelocity} / day
                    </td>
                    <td className="py-3.5 text-center font-mono font-medium text-text-ondark text-sm">
                      {v.stock}
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="inline-flex items-center gap-1 border border-hairline bg-bg-primary/60 p-0.5">
                        <button
                          type="button"
                          disabled={isAdjusting || v.stock === 0}
                          onClick={() => handleAdjustStock(v.id, -1)}
                          className="p-1 hover:bg-white/10 text-text-ondark/60 hover:text-text-ondark disabled:opacity-30 transition-colors"
                          title="Decrease by 1"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 font-mono text-xs text-text-ondark min-w-[28px] text-center">
                          {isAdjusting ? <RefreshCw size={11} className="animate-spin inline" /> : v.stock}
                        </span>
                        <button
                          type="button"
                          disabled={isAdjusting}
                          onClick={() => handleAdjustStock(v.id, 1)}
                          className="p-1 hover:bg-white/10 text-accent-brass hover:text-accent-brass/80 disabled:opacity-30 transition-colors"
                          title="Increase by 1"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
