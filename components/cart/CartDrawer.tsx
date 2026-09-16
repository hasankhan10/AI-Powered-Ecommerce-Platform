'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { brandConfig } from '@/config/brand.config';
import { content } from '@/config/content';

export function CartDrawer() {
  const { isOpen, closeCart, cart, fetchCart, updateQuantity, removeItem, isLoading } =
    useCartStore();

  const [freeShippingThreshold, setFreeShippingThreshold] = useState(2000);
  const [enableFreeShipping, setEnableFreeShipping] = useState(true);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/settings/shipping')
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings) {
          setFreeShippingThreshold(data.settings.freeDeliveryThreshold);
          setEnableFreeShipping(data.settings.enableFreeDelivery);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const progressToFreeShipping = Math.min(
    100,
    (cart.subtotal / (freeShippingThreshold || 2000)) * 100
  );
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - cart.subtotal);

  const formattedSubtotal = new Intl.NumberFormat(brandConfig.currency.locale, {
    style: 'currency',
    currency: brandConfig.currency.code,
    maximumFractionDigits: 0,
  }).format(cart.subtotal);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-bg-deep/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={closeCart}
      />

      {/* Drawer Panel */}
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-hairline bg-bg-primary text-text-ondark shadow-2xl z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hairline p-6">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-accent-brass" />
            <h2 className="font-serif text-xl font-light tracking-wide text-text-ondark">
              {content.cart.title}
            </h2>
            <span className="text-xs font-mono text-text-ondark/50">
              ({cart.totalCount})
            </span>
          </div>

          <button
            onClick={closeCart}
            className="text-text-ondark/60 hover:text-accent-brass transition-colors p-1"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Meter */}
        <div className="border-b border-hairline bg-bg-deep/60 px-6 py-3.5 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-light">
            {remainingForFreeShipping === 0 ? (
              <span className="text-accent-brass flex items-center gap-1.5 font-medium">
                <Sparkles size={12} /> You unlocked free shipping!
              </span>
            ) : (
              <span className="text-text-ondark/70">
                Add ₹{remainingForFreeShipping.toLocaleString('en-IN')} more for free shipping
              </span>
            )}
            <span className="text-text-ondark/40 font-mono">
              {Math.round(progressToFreeShipping)}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-bg-primary overflow-hidden rounded-full">
            <div
              className="h-full bg-accent-brass rounded-full transition-all duration-500"
              style={{ width: `${progressToFreeShipping}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center space-y-4">
              <ShoppingBag size={36} className="text-accent-brass/40 stroke-1" />
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-light text-text-ondark">
                  {content.cart.emptyTitle}
                </h3>
                <p className="text-xs text-text-ondark/60 font-light">
                  {content.cart.emptyBody}
                </p>
              </div>
              <button
                onClick={closeCart}
                className="mt-4 bg-accent-brass px-6 py-3 text-xs uppercase tracking-[0.2em] font-medium text-bg-primary hover:bg-accent-brass-hover transition-colors rounded-md shadow-sm"
              >
                {content.cart.continueShopping}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-hairline space-y-6">
              {cart.items.map((item) => {
                const itemPriceFormatted = new Intl.NumberFormat(
                  brandConfig.currency.locale,
                  {
                    style: 'currency',
                    currency: brandConfig.currency.code,
                    maximumFractionDigits: 0,
                  }
                ).format(item.price);

                return (
                  <div key={item.id} className="pt-6 first:pt-0 flex gap-4">
                    {/* Thumbnail */}
                    <div className="relative h-24 w-20 shrink-0 border border-hairline bg-bg-deep overflow-hidden rounded-md">
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        sizes="80px"
                        className="object-cover object-center"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <Link
                            href={`/product/${item.productSlug}`}
                            onClick={closeCart}
                            className="font-serif text-sm font-light text-text-ondark hover:text-accent-brass transition-colors line-clamp-1"
                          >
                            {item.productName}
                          </Link>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-text-ondark/40 hover:text-red-400 transition-colors p-1 rounded-md"
                            aria-label="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Variant size/color chips */}
                        <div className="flex items-center gap-2 text-[11px] text-text-ondark/60 font-light">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.size && item.color && <span>•</span>}
                          {item.color && <span>Colour: {item.color}</span>}
                        </div>
                      </div>

                      {/* Price & Quantity Controls */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-hairline bg-bg-deep rounded-md overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2.5 py-1 text-xs text-text-ondark/60 hover:text-accent-brass transition-colors"
                          >
                            -
                          </button>
                          <span className="px-3 text-xs font-mono text-text-ondark">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2.5 py-1 text-xs text-text-ondark/60 hover:text-accent-brass transition-colors"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-xs font-serif text-text-ondark font-light">
                          {itemPriceFormatted}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer / Checkout CTA */}
        {cart.items.length > 0 && (
          <div className="border-t border-hairline bg-bg-deep/80 p-6 space-y-4">
            <div className="flex justify-between items-baseline">
              <span className="text-xs uppercase tracking-[0.2em] text-text-ondark/70">
                {content.cart.subtotalLabel}
              </span>
              <span className="font-serif text-xl font-light text-text-ondark">
                {formattedSubtotal}
              </span>
            </div>
            <p className="text-[11px] text-text-ondark/40 font-light">
              Shipping & taxes calculated at checkout.
            </p>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full bg-accent-brass py-4 text-xs uppercase tracking-[0.25em] font-medium text-bg-primary hover:bg-accent-brass-hover transition-colors flex items-center justify-center gap-2 rounded-md shadow-md"
            >
              {content.cart.checkoutCta}
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
