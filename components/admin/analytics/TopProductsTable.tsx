'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Package, ExternalLink, ArrowUpRight } from 'lucide-react';
import { AnalyticsTopProduct } from '@/lib/db/analytics';

interface TopProductsTableProps {
  products: AnalyticsTopProduct[];
}

export function TopProductsTable({ products }: TopProductsTableProps) {
  const topList = products.slice(0, 6);
  const maxRevenue = Math.max(...topList.map((p) => p.totalRevenue), 1);

  return (
    <div className="border border-hairline bg-bg-deep p-4 sm:p-6 space-y-4 sm:space-y-6 rounded-md shadow-sm">
      <div className="flex items-center justify-between border-b border-hairline pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium block">
            Catalogue Performance
          </span>
          <h3 className="font-serif text-lg sm:text-xl font-light text-text-ondark mt-0.5">
            Top Performing Pieces
          </h3>
        </div>
        <Link
          href="/admin/products"
          className="text-xs text-accent-brass hover:underline flex items-center gap-1 font-medium"
        >
          <span>Manage Catalogue</span>
          <ArrowUpRight size={13} />
        </Link>
      </div>

      {topList.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <Package size={28} className="text-accent-brass/40 mx-auto" />
          <p className="text-xs text-text-ondark/60 font-light">No sales recorded yet.</p>
          <p className="text-[10px] text-text-ondark/40">
            Completed orders will populate piece velocity and revenue rankings.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left text-xs min-w-[540px]">
            <thead>
              <tr className="border-b border-hairline text-[10px] uppercase tracking-wider text-text-ondark/40">
                <th className="pb-3 font-medium w-8">#</th>
                <th className="pb-3 font-medium">Piece</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium text-center">Volume</th>
                <th className="pb-3 font-medium text-right">Revenue</th>
                <th className="pb-3 font-medium text-right">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {topList.map((prod, idx) => {
                const revShare = Math.round((prod.totalRevenue / maxRevenue) * 100);

                return (
                  <tr key={prod.id} className="hover:bg-bg-primary/40 transition-colors group">
                    <td className="py-3.5 font-mono text-text-ondark/40 text-xs">
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-12 bg-bg-primary overflow-hidden border border-hairline shrink-0">
                          {prod.image ? (
                            <Image
                              src={prod.image}
                              alt={prod.name}
                              fill
                              sizes="40px"
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
                            href={`/product/${prod.slug}`}
                            className="font-serif font-light text-text-ondark hover:text-accent-brass transition-colors truncate block"
                          >
                            {prod.name}
                          </Link>
                          <span className="text-[10px] font-mono text-text-ondark/50">
                            ₹{prod.basePrice.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-text-ondark/60 text-[11px]">
                      {prod.category}
                    </td>
                    <td className="py-3.5 text-center font-mono text-text-ondark">
                      {prod.unitsSold} {prod.unitsSold === 1 ? 'unit' : 'units'}
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="font-serif text-text-ondark">
                        ₹{prod.totalRevenue.toLocaleString('en-IN')}
                      </div>
                      {prod.totalRevenue > 0 && (
                        <div className="w-16 h-1 bg-bg-primary ml-auto mt-1 overflow-hidden">
                          <div
                            className="h-full bg-accent-brass"
                            style={{ width: `${revShare}%` }}
                          />
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase font-mono border ${
                          prod.stock === 0
                            ? 'border-rose-500/30 text-rose-400 bg-rose-500/10'
                            : prod.stock <= 5
                            ? 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                            : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                        }`}
                      >
                        {prod.stock === 0 ? 'Out of Stock' : `${prod.stock} in stock`}
                      </span>
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
