'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  ChevronRight,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from '@/lib/store/useToast';
import { OrderFilterBar } from './OrderFilterBar';
import { OrderDetailModal } from './OrderDetailModal';

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

      toast.success(`Fulfillment status updated to ${newStatus}`, 'Order Status Updated');
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
      <OrderFilterBar
        orders={orders}
        selectedStatus={selectedStatus}
        searchQuery={searchQuery}
        onStatusChange={setSelectedStatus}
        onSearchChange={setSearchQuery}
      />

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
      <OrderDetailModal
        order={selectedOrder}
        updatingId={updatingId}
        getStatusBadge={getStatusBadge}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
