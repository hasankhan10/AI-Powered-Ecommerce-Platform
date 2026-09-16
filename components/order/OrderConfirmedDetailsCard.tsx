'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Banknote, ShieldCheck } from 'lucide-react';

export interface OrderItemDisplay {
  id: string;
  name: string;
  size?: string | null;
  color?: string | null;
  quantity: number;
  price: number;
  imageUrl: string;
}

export interface OrderAddressDisplay {
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pincode: string;
  country?: string | null;
}

interface OrderConfirmedDetailsCardProps {
  orderItems: OrderItemDisplay[];
  address: OrderAddressDisplay | null;
  total: number | null;
  isCOD: boolean;
}

export function OrderConfirmedDetailsCard({
  orderItems,
  address,
  total,
  isCOD,
}: OrderConfirmedDetailsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="border border-hairline bg-bg-deep p-6 sm:p-8 rounded-lg space-y-8 shadow-sm"
    >
      {/* Ordered Pieces */}
      {orderItems.length > 0 && (
        <div className="space-y-4 border-b border-hairline/60 pb-6">
          <h3 className="text-xs uppercase tracking-[0.2em] text-text-ondark font-medium">
            Acquired Pieces ({orderItems.reduce((acc, i) => acc + i.quantity, 0)})
          </h3>
          <div className="divide-y divide-hairline">
            {orderItems.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 flex gap-4 items-center">
                <div className="relative h-16 w-14 shrink-0 border border-hairline bg-bg-primary overflow-hidden rounded-md">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="60px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif text-sm font-light text-text-ondark truncate">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-text-ondark/50 font-light">
                    Qty: {item.quantity} {item.size ? `• Size: ${item.size}` : ''}{' '}
                    {item.color ? `• Color: ${item.color}` : ''}
                  </p>
                </div>
                <span className="text-xs font-serif font-light text-text-ondark">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shipping Destination & Payment Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs font-light">
        {address ? (
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-accent-brass font-medium block">
              Shipping Destination
            </span>
            <p className="text-text-ondark/90 font-medium">{address.line1}</p>
            {address.line2 && <p className="text-text-ondark/70">{address.line2}</p>}
            <p className="text-text-ondark/70">
              {address.city}, {address.state} — {address.pincode}
            </p>
            <p className="text-text-ondark/50 text-[10px]">{address.country || 'India'}</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-wider text-accent-brass font-medium block">
              Shipping Destination
            </span>
            <p className="text-text-ondark/70">Standard Domestic Express</p>
          </div>
        )}

        {total !== null && (
          <div className="space-y-2 sm:text-right">
            <span className="text-[10px] uppercase tracking-wider text-text-ondark/40 block">
              {isCOD ? 'Amount Payable On Delivery' : 'Total Amount Paid'}
            </span>
            <p className="font-serif text-3xl font-light text-accent-brass">
              ₹{total.toLocaleString('en-IN')}
            </p>
            <div className="inline-flex items-center gap-1.5 text-[10px] text-text-ondark/60 sm:justify-end">
              {isCOD ? (
                <>
                  <Banknote size={13} className="text-accent-brass" />
                  <span>Cash on Delivery (Courier Collection)</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>Paid via 256-bit Secured Gateway</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
