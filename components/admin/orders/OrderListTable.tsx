'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ShoppingBag,
  Search,
  ChevronRight,
  X,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  AlertCircle,
  RotateCcw,
  User,
  MapPin,
  CreditCard,
  ExternalLink,
} from 'lucide-react';
import { toast } from '@/lib/store/useToast';

export interface OrderItemDetail {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  variantColor?: string;
  variantSize?: string;
  variantSku?: string;
  quantity: number;
  priceAtPurchase: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  updatedAt: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  customer?: {
    id: string;
    name?: string | null;
    email: string;
    phone?: string | null;
  } | null;
  shippingAddress?: {
    street?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
  } | null;
  items: OrderItemDetail[];
}

interface OrderListTableProps {
  initialOrders: AdminOrder[];
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; border: string; bg: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: 'Pending',
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    icon: <Clock size={12} />,
  },
  PROCESSING: {
    label: 'Processing',
    color: 'text-sky-400',
    border: 'border-sky-500/30',
    bg: 'bg-sky-500/10',
    icon: <Package size={12} />,
  },
  SHIPPED: {
    label: 'Shipped',
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
    icon: <Truck size={12} />,
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    icon: <CheckCircle2 size={12} />,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'text-rose-400',
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/10',
    icon: <AlertCircle size={12} />,
  },
};

export function OrderListTable({ initialOrders }: OrderListTableProps) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const statuses = ['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  const filteredOrders = orders.filter((order) => {
    if (selectedStatus !== 'ALL' && order.status !== selectedStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNumber = order.orderNumber.toLowerCase().includes(q);
      const matchEmail = order.customer?.email.toLowerCase().includes(q);
      const matchName = order.customer?.name?.toLowerCase().includes(q);
      return matchNumber || matchEmail || matchName;
    }
    return true;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || `Failed to update status (${res.status})`);
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: newStatus as AdminOrder['status'], updatedAt: new Date().toISOString() }
            : o
        )
      );

      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) =>
          prev
            ? { ...prev, status: newStatus as AdminOrder['status'], updatedAt: new Date().toISOString() }
            : null
        );
      }

      toast.success(`Fulfillment status updated to ${newStatus}`, {
        title: 'Order Status Updated',
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || {
      label: status,
      color: 'text-text-ondark/60',
      border: 'border-hairline',
      bg: 'bg-transparent',
      icon: null,
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium border ${config.border} ${config.bg} ${config.color}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {statuses.map((st) => {
            const count =
              st === 'ALL'
                ? orders.length
                : orders.filter((o) => o.status === st).length;
            const isActive = selectedStatus === st;

            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 text-xs uppercase tracking-wider transition-colors whitespace-nowrap flex items-center gap-2 border ${
                  isActive
                    ? 'border-accent-brass bg-accent-brass/10 text-accent-brass font-medium'
                    : 'border-hairline text-text-ondark/60 hover:text-text-ondark hover:border-text-ondark/30'
                }`}
              >
                <span>{st}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-accent-brass/20 text-accent-brass' : 'bg-white/5 text-text-ondark/40'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-ondark/40"
          />
          <input
            type="text"
            placeholder="Search order or customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-deep border border-hairline pl-9 pr-4 py-1.5 text-xs text-text-ondark placeholder:text-text-ondark/30 focus:outline-none focus:border-accent-brass transition-colors"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="border border-hairline bg-bg-deep">
        {filteredOrders.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <ShoppingBag size={36} className="text-accent-brass/40 mx-auto" />
            <p className="text-xs text-text-ondark/60 font-light">
              {searchQuery || selectedStatus !== 'ALL'
                ? 'No orders match your filter criteria.'
                : 'No orders have been recorded yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[720px]">
              <thead>
                <tr className="border-b border-hairline text-[10px] uppercase tracking-wider text-text-ondark/50">
                  <th className="p-4 font-medium">Order Number</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Fulfillment Status</th>
                  <th className="p-4 font-medium">Payment</th>
                  <th className="p-4 font-medium text-right">Total</th>
                  <th className="p-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filteredOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    className="hover:bg-bg-primary/40 transition-colors group cursor-pointer"
                    onClick={() => setSelectedOrder(ord)}
                  >
                    <td className="p-4 font-mono text-accent-brass flex items-center gap-2">
                      <span>{ord.orderNumber}</span>
                      <span className="text-[10px] text-text-ondark/40 font-sans">
                        ({ord.items.length} {ord.items.length === 1 ? 'item' : 'items'})
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-text-ondark">
                        {ord.customer?.name || 'Guest Customer'}
                      </div>
                      <div className="text-[11px] text-text-ondark/50 font-light">
                        {ord.customer?.email}
                      </div>
                    </td>
                    <td className="p-4 text-text-ondark/60 font-light">
                      {new Date(ord.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={ord.status}
                        disabled={updatingId === ord.id}
                        onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                        className="bg-bg-primary border border-hairline text-text-ondark text-xs px-2.5 py-1 focus:outline-none focus:border-accent-brass transition-colors cursor-pointer"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase font-medium border ${
                          ord.paymentStatus === 'PAID'
                            ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                            : ord.paymentStatus === 'PENDING'
                            ? 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                            : 'border-rose-500/30 text-rose-400 bg-rose-500/10'
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right font-serif text-text-ondark text-sm">
                      ₹{ord.total.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(ord);
                        }}
                        className="text-xs text-accent-brass hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        Details
                        <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-bg-deep border border-hairline max-w-2xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-hairline pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-mono text-lg text-accent-brass">
                    {selectedOrder.orderNumber}
                  </h3>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <p className="text-xs text-text-ondark/50 font-light mt-1">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
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
                value={selectedOrder.status}
                disabled={updatingId === selectedOrder.id}
                onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
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
                    {selectedOrder.customer?.name || 'Guest Checkout'}
                  </p>
                  <p>{selectedOrder.customer?.email}</p>
                  {selectedOrder.customer?.phone && (
                    <p className="text-text-ondark/60">{selectedOrder.customer.phone}</p>
                  )}
                </div>
              </div>

              <div className="border border-hairline p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-accent-brass font-medium">
                  <MapPin size={14} />
                  Shipping Destination
                </div>
                <div className="text-xs space-y-1 text-text-ondark/80">
                  {selectedOrder.shippingAddress ? (
                    <>
                      <p>{selectedOrder.shippingAddress.street || 'Address on file'}</p>
                      <p>
                        {[
                          selectedOrder.shippingAddress.city,
                          selectedOrder.shippingAddress.state,
                          selectedOrder.shippingAddress.postalCode,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </p>
                      <p className="text-text-ondark/50">
                        {selectedOrder.shippingAddress.country || 'India'}
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
                Purchased Items ({selectedOrder.items.length})
              </h4>
              <div className="border border-hairline divide-y divide-hairline">
                {selectedOrder.items.map((item) => (
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
                <span>₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-xs text-text-ondark/60">
                <span>Shipping</span>
                <span>
                  {selectedOrder.shipping === 0
                    ? 'Complimentary'
                    : `₹${selectedOrder.shipping.toLocaleString('en-IN')}`}
                </span>
              </div>
              <div className="flex justify-between text-xs text-text-ondark/60">
                <span>Tax</span>
                <span>
                  {selectedOrder.tax === 0
                    ? 'Included'
                    : `₹${selectedOrder.tax.toLocaleString('en-IN')}`}
                </span>
              </div>
              <div className="border-t border-hairline pt-2 flex justify-between text-sm font-serif text-text-ondark font-medium">
                <span>Total Amount</span>
                <span className="text-accent-brass">
                  ₹{selectedOrder.total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 border border-hairline text-xs uppercase tracking-wider text-text-ondark hover:border-text-ondark/50 transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
