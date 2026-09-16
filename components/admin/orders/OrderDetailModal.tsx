'use client';

import React from 'react';
import Image from 'next/image';
import { X, User, MapPin } from 'lucide-react';
import { AdminOrder } from './OrderListTable';

interface OrderDetailModalProps {
  order: AdminOrder | null;
  updatingId: string | null;
  getStatusBadge: (status: string) => React.ReactNode;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: string) => void;
}

export function OrderDetailModal({
  order,
  updatingId,
  getStatusBadge,
  onClose,
  onUpdateStatus,
}: OrderDetailModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-bg-deep border border-hairline max-w-2xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-hairline pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-mono text-lg text-accent-brass">
                {order.orderNumber}
              </h3>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-xs text-text-ondark/50 font-light mt-1">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-ondark/40 hover:text-text-ondark transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Status Changer */}
        <div className="p-4 border border-hairline bg-bg-primary/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs text-text-ondark/70 block">Change Fulfillment Status</span>
            <span className="text-[11px] text-text-ondark/40">
              Updates customer dashboard and order confirmation state.
            </span>
          </div>
          <select
            value={order.status}
            disabled={updatingId === order.id}
            onChange={(e) => onUpdateStatus(order.id, e.target.value)}
            className="bg-bg-deep border border-accent-brass/50 text-accent-brass text-xs px-3 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="PENDING">PENDING</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="SHIPPED">SHIPPED</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        {/* Customer & Shipping Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="border border-hairline p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-accent-brass font-medium">
              <User size={14} />
              Customer Information
            </div>
            <div className="text-xs space-y-1 text-text-ondark/80">
              <p className="font-medium text-text-ondark">
                {order.customer?.name || 'Guest Checkout'}
              </p>
              <p>{order.customer?.email}</p>
              {order.customer?.phone && (
                <p className="text-text-ondark/60">{order.customer.phone}</p>
              )}
            </div>
          </div>

          <div className="border border-hairline p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-accent-brass font-medium">
              <MapPin size={14} />
              Shipping Destination
            </div>
            <div className="text-xs space-y-1 text-text-ondark/80">
              {order.shippingAddress ? (
                <>
                  <p>{order.shippingAddress.street || 'Address on file'}</p>
                  <p>
                    {[
                      order.shippingAddress.city,
                      order.shippingAddress.state,
                      order.shippingAddress.postalCode,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  <p className="text-text-ondark/50">
                    {order.shippingAddress.country || 'India'}
                  </p>
                </>
              ) : (
                <p className="text-text-ondark/40 italic">No specific address provided</p>
              )}
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase tracking-wider text-text-ondark/60 font-medium">
            Purchased Items ({order.items.length})
          </h4>
          <div className="border border-hairline divide-y divide-hairline">
            {order.items.map((item) => (
              <div key={item.id} className="p-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-12 h-14 bg-bg-primary overflow-hidden border border-hairline flex-shrink-0">
                    {item.productImage ? (
                      <Image
                        src={item.productImage}
                        alt={item.productTitle}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-text-ondark/30">
                        N/A
                      </div>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-text-ondark">
                      {item.productTitle}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-text-ondark/50">
                      {item.variantColor && <span>Color: {item.variantColor}</span>}
                      {item.variantSize && <span>Size: {item.variantSize}</span>}
                      {item.variantSku && (
                        <span className="font-mono text-[10px]">SKU: {item.variantSku}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-ondark/60">
                      Qty: {item.quantity} × ₹{item.priceAtPurchase.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
                <div className="text-right font-serif text-sm text-text-ondark">
                  ₹{(item.quantity * item.priceAtPurchase).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="border border-hairline p-4 space-y-2 bg-bg-primary/30">
          <div className="flex justify-between text-xs text-text-ondark/60">
            <span>Subtotal</span>
            <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-xs text-text-ondark/60">
            <span>Shipping</span>
            <span>
              {order.shipping === 0
                ? 'Complimentary'
                : `₹${order.shipping.toLocaleString('en-IN')}`}
            </span>
          </div>
          <div className="flex justify-between text-xs text-text-ondark/60">
            <span>Tax</span>
            <span>
              {order.tax === 0 ? 'Included' : `₹${order.tax.toLocaleString('en-IN')}`}
            </span>
          </div>
          <div className="border-t border-hairline pt-2 flex justify-between text-sm font-serif text-text-ondark font-medium">
            <span>Total Amount</span>
            <span className="text-accent-brass">
              ₹{order.total.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-hairline text-xs uppercase tracking-wider text-text-ondark hover:border-text-ondark/50 transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
