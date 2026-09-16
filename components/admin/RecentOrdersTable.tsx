import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface OrderItem {
  id: string;
  orderNumber: string;
  customerEmail: string;
  status: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
}

interface RecentOrdersTableProps {
  orders: OrderItem[];
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const getStatusBadge = (status: string, paymentStatus: string) => {
    if (paymentStatus === 'PAID') {
      return (
        <span className="inline-flex items-center border border-emerald-500/40 bg-emerald-950/20 px-2.5 py-0.5 text-[10px] text-emerald-400 rounded-md">
          PAID
        </span>
      );
    }
    if (paymentStatus === 'FAILED') {
      return (
        <span className="inline-flex items-center border border-red-500/40 bg-red-950/20 px-2.5 py-0.5 text-[10px] text-red-400 rounded-md">
          FAILED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center border border-amber-500/40 bg-amber-950/20 px-2.5 py-0.5 text-[10px] text-amber-400 rounded-md">
        {status}
      </span>
    );
  };

  return (
    <div className="border border-hairline bg-bg-deep p-4 sm:p-6 space-y-4 sm:space-y-6 rounded-md shadow-sm">
      <div className="flex items-center justify-between border-b border-hairline pb-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium">
            Fulfillment Activity
          </span>
          <h3 className="font-serif text-lg sm:text-xl font-light text-text-ondark">
            Recent Orders
          </h3>
        </div>
        <Link
          href="/admin/orders"
          className="flex items-center gap-1.5 text-xs text-text-ondark/60 hover:text-accent-brass transition-colors"
        >
          <span>View All</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="py-12 text-center text-xs text-text-ondark/40 font-light">
          No orders received yet. Live orders will populate here automatically.
        </div>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left text-xs min-w-[480px]">
            <thead>
              <tr className="border-b border-hairline text-[10px] uppercase tracking-wider text-text-ondark/50 whitespace-nowrap">
                <th className="pb-3 font-medium">Order Number</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-bg-primary/40 transition-colors">
                  <td className="py-3.5 font-mono text-accent-brass whitespace-nowrap">
                    {ord.orderNumber}
                  </td>
                  <td className="py-3.5 text-text-ondark/80 max-w-[150px] truncate">{ord.customerEmail}</td>
                  <td className="py-3.5 text-text-ondark/50 font-light whitespace-nowrap">{ord.createdAt}</td>
                  <td className="py-3.5 whitespace-nowrap">
                    {getStatusBadge(ord.status, ord.paymentStatus)}
                  </td>
                  <td className="py-3.5 text-right font-serif text-text-ondark whitespace-nowrap">
                    ₹{ord.total.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
