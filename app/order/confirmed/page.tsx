import React from 'react';
import { redirect } from 'next/navigation';

interface ConfirmedPageProps {
  searchParams: Promise<{
    orderNumber?: string;
    orderId?: string;
    method?: string;
  }>;
}

export default async function OrderConfirmedPage({ searchParams }: ConfirmedPageProps) {
  const { orderNumber, orderId, method } = await searchParams;
  const params = new URLSearchParams();
  if (orderNumber) params.set('orderNumber', orderNumber);
  if (orderId) params.set('orderId', orderId);
  if (method) params.set('method', method);

  redirect(`/order-confirm?${params.toString()}`);
}
