'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Lock, ArrowLeft, CheckCircle2, AlertCircle, MapPin, Check, CreditCard, Banknote, Truck } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { createClient } from '@/lib/supabase/client';
import { brandConfig } from '@/config/brand.config';
import { content } from '@/config/content';
import { UserAddress } from '@/lib/types/address';
import { toast } from '@/lib/store/useToast';
import { LuxuryLoader } from '@/components/ui/LuxuryLoader';

export function CheckoutClient() {
  const router = useRouter();
  const { cart, fetchCart } = useCartStore();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Load authenticated user info and saved addresses
  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        if (user.email) setEmail(user.email);
        const userFullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
        if (userFullName) setName(userFullName);
        const userPhone = user.user_metadata?.phone || '';
        if (userPhone) setPhone(userPhone);

        const addrs: UserAddress[] = user.user_metadata?.addresses || [];
        if (addrs.length > 0) {
          setSavedAddresses(addrs);
          const defaultAddr = addrs.find((a) => a.isDefault) || addrs[0];
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
            if (defaultAddr.name) setName(defaultAddr.name);
            if (defaultAddr.phone) setPhone(defaultAddr.phone);
            setLine1(defaultAddr.line1);
            setLine2(defaultAddr.line2 || '');
            setCity(defaultAddr.city);
            setState(defaultAddr.state);
            setPincode(defaultAddr.pincode);
          }
        }
      }
    }

    loadUser();
  }, [supabase]);

  const handleSelectAddress = (addr: UserAddress) => {
    setSelectedAddressId(addr.id);
    if (addr.name) setName(addr.name);
    if (addr.phone) setPhone(addr.phone);
    setLine1(addr.line1);
    setLine2(addr.line2 || '');
    setCity(addr.city);
    setState(addr.state);
    setPincode(addr.pincode);
  };

  const handleClearAddressSelection = () => {
    setSelectedAddressId(null);
    setLine1('');
    setLine2('');
    setCity('');
    setState('');
    setPincode('');
  };

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const [shippingSettings, setShippingSettings] = useState({
    freeDeliveryThreshold: 2000,
    standardDeliveryFee: 150,
    enableFreeDelivery: true,
    estimatedDeliveryDays: '3-5 Business Days',
  });

  useEffect(() => {
    // Load dynamic shipping config from store settings
    fetch('/api/settings/shipping')
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings) {
          setShippingSettings(data.settings);
        }
      })
      .catch((err) => console.error('Error fetching checkout shipping settings:', err));
  }, []);

  const isFreeShipping =
    shippingSettings.enableFreeDelivery &&
    (cart.subtotal >= shippingSettings.freeDeliveryThreshold || cart.subtotal === 0);

  const shippingFee = isFreeShipping ? 0 : shippingSettings.standardDeliveryFee;
  const grandTotal = cart.subtotal + shippingFee;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !line1 || !city || !state || !pincode) {
      setErrorMsg('Please complete all required shipping fields.');
      toast.warning('Please complete all required shipping fields.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Create order on backend
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: email,
          customerName: name,
          customerPhone: phone,
          paymentMethod,
          shippingAddress: {
            line1,
            line2,
            city,
            state,
            pincode,
            country: 'India',
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to initialize order');
      }

      const orderData = await res.json();

      // If Cash on Delivery, order is confirmed immediately!
      if (orderData.isCOD) {
        await fetchCart();
        toast.success(`Order ${orderData.orderNumber} placed via Cash on Delivery!`, {
          title: 'Order Confirmed',
        });
        router.push(`/order-confirm?orderNumber=${orderData.orderNumber}&orderId=${orderData.orderId}&method=cod`);
        return;
      }

      // 2. Open Razorpay Checkout modal if Razorpay is available on window
      const hasRealKeys =
        orderData.keyId &&
        !orderData.keyId.includes('placeholder') &&
        !orderData.keyId.includes('rzp_test_demo');

      if ((window as any).Razorpay && hasRealKeys) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: brandConfig.name,
          description: `Order ${orderData.orderNumber}`,
          order_id: orderData.razorpayOrderId,
          prefill: {
            name,
            email,
            contact: phone,
          },
          theme: {
            color: '#C6A87D', // Accent brass
          },
          handler: async function (response: any) {
            // 3. Verify signature
            const verifyRes = await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: orderData.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              await fetchCart();
              toast.success('Payment authorized & order confirmed!', {
                title: 'Order Confirmed',
              });
              router.push(`/order-confirm?orderNumber=${orderData.orderNumber}&orderId=${orderData.orderId}`);
            } else {
              toast.error('Payment verification failed. Please try again.');
              router.push(`/order/failed?orderNumber=${orderData.orderNumber}`);
            }
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Simulated test mode verification for immediate local testing without external keys
        const verifyRes = await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderData.orderId,
            razorpayOrderId: orderData.razorpayOrderId,
            razorpayPaymentId: `pay_test_${Date.now()}`,
            razorpaySignature: 'simulated_test_sig',
            isSimulated: true,
          }),
        });

        if (verifyRes.ok) {
          await fetchCart();
          toast.success('Order placed successfully!', {
            title: 'Order Confirmed',
          });
          router.push(`/order-confirm?orderNumber=${orderData.orderNumber}&orderId=${orderData.orderId}`);
        } else {
          throw new Error('Verification failed');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment processing error');
      toast.error(err.message || 'Payment processing error');
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center space-y-6">
        <h2 className="font-serif text-3xl font-light text-text-ondark">
          {content.cart.emptyTitle}
        </h2>
        <p className="text-xs text-text-ondark/60 font-light">
          You need items in your cart to proceed to checkout.
        </p>
        <Link
          href="/shop"
          className="inline-block bg-accent-brass px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-medium text-bg-primary hover:bg-accent-brass-hover transition-colors rounded-md shadow-md"
        >
          {content.cart.continueShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-bg-primary py-12 lg:py-16 text-text-ondark">
      {loading && (
        <LuxuryLoader
          size="fullscreen"
          label={paymentMethod === 'COD' ? 'Confirming Bespoke Order...' : 'Connecting to Secured Gateway...'}
          sublabel="Maison Vale Private Checkout"
        />
      )}
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Navigation / Back link */}
        <div className="mb-8">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-text-ondark/60 hover:text-accent-brass transition-colors"
          >
            <ArrowLeft size={14} /> Back to Shop
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Form: Shipping Details (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="border-b border-hairline pb-4">
              <span className="text-[10px] uppercase tracking-[0.3em] text-accent-brass font-medium">
                Step 1 of 2
              </span>
              <h1 className="font-serif text-3xl font-light text-text-ondark tracking-tight mt-1">
                {content.checkout.shippingTitle}
              </h1>
            </div>

            {errorMsg && (
              <div className="border border-red-500/40 bg-red-950/20 p-4 text-xs text-red-300 flex items-center gap-2 rounded-md">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handlePayment} className="space-y-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-[0.2em] text-accent-brass font-medium">
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Mehedi Hasan"
                      className="w-full border border-hairline bg-bg-deep px-4 py-3 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none transition-colors rounded-md"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full border border-hairline bg-bg-deep px-4 py-3 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none transition-colors rounded-md"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                    Phone Number (for delivery SMS)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full border border-hairline bg-bg-deep px-4 py-3 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none transition-colors rounded-md"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-4 pt-4 border-t border-hairline">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-accent-brass font-medium">
                    Shipping Address
                  </h3>
                  {savedAddresses.length > 0 && (
                    <Link
                      href="/account"
                      target="_blank"
                      className="text-[10px] text-accent-brass/80 hover:text-accent-brass transition-colors underline underline-offset-4"
                    >
                      Manage Addresses
                    </Link>
                  )}
                </div>

                {savedAddresses.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-[11px] text-text-ondark/60 font-light">
                      Choose from your saved addresses:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <div
                            key={addr.id}
                            onClick={() => handleSelectAddress(addr)}
                            className={`p-3.5 rounded-lg border cursor-pointer transition-all relative ${
                              isSelected
                                ? 'border-accent-brass bg-accent-brass/10 ring-1 ring-accent-brass shadow-sm'
                                : 'border-hairline bg-bg-deep/70 hover:border-text-ondark/30'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] uppercase font-semibold tracking-wider text-accent-brass">
                                {addr.tag || 'Saved'}
                              </span>
                              {isSelected ? (
                                <span className="flex items-center gap-1 text-[10px] text-accent-brass font-medium">
                                  <Check size={12} /> Selected
                                </span>
                              ) : (
                                addr.isDefault && (
                                  <span className="text-[9px] uppercase tracking-wider text-text-ondark/40">
                                    Default
                                  </span>
                                )
                              )}
                            </div>
                            <p className="text-xs font-medium text-text-ondark truncate">{addr.name}</p>
                            <p className="text-[11px] text-text-ondark/70 mt-0.5 line-clamp-2 leading-relaxed">
                              {addr.line1}
                              {addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} - {addr.pincode}
                            </p>
                            {addr.phone && (
                              <p className="text-[10px] text-text-ondark/50 mt-1 font-mono">{addr.phone}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {selectedAddressId && (
                      <button
                        type="button"
                        onClick={handleClearAddressSelection}
                        className="text-[11px] text-accent-brass hover:underline pt-1"
                      >
                        + Or enter a different shipping address below
                      </button>
                    )}
                  </div>
                )}
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    required
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                    placeholder="House / Apartment no., Street"
                    className="w-full border border-hairline bg-bg-deep px-4 py-3 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none transition-colors rounded-md"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={line2}
                    onChange={(e) => setLine2(e.target.value)}
                    placeholder="Landmark, Area"
                    className="w-full border border-hairline bg-bg-deep px-4 py-3 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none transition-colors rounded-md"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Chennai"
                      className="w-full border border-hairline bg-bg-deep px-4 py-3 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none transition-colors rounded-md"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                      State *
                    </label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Tamil Nadu"
                      className="w-full border border-hairline bg-bg-deep px-4 py-3 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none transition-colors rounded-md"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="600018"
                      className="w-full border border-hairline bg-bg-deep px-4 py-3 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none transition-colors rounded-md"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-4 pt-4 border-t border-hairline">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-accent-brass font-medium">
                    Step 2 of 2
                  </span>
                  <h3 className="font-serif text-xl font-light text-text-ondark mt-0.5">
                    Payment Method
                  </h3>
                  <p className="text-xs text-text-ondark/60 font-light mt-0.5">
                    Select your preferred transaction method.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Option 1: Online Payment */}
                  <div
                    onClick={() => setPaymentMethod('ONLINE')}
                    className={`p-4 rounded-lg border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                      paymentMethod === 'ONLINE'
                        ? 'border-accent-brass bg-accent-brass/10 ring-1 ring-accent-brass shadow-sm'
                        : 'border-hairline bg-bg-deep/70 hover:border-text-ondark/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CreditCard size={18} className="text-accent-brass" />
                        <span className="text-xs font-medium text-text-ondark">
                          Online Payment
                        </span>
                      </div>
                      {paymentMethod === 'ONLINE' && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent-brass text-bg-primary">
                          <Check size={11} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-ondark/60 leading-relaxed font-light">
                      Cards (Visa, Mastercard, RuPay), UPI, NetBanking & Wallets.
                    </p>
                    <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-mono">
                      ● Instant Online Verification
                    </span>
                  </div>

                  {/* Option 2: Cash on Delivery (COD) */}
                  <div
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-4 rounded-lg border cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                      paymentMethod === 'COD'
                        ? 'border-accent-brass bg-accent-brass/10 ring-1 ring-accent-brass shadow-sm'
                        : 'border-hairline bg-bg-deep/70 hover:border-text-ondark/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Banknote size={18} className="text-accent-brass" />
                        <span className="text-xs font-medium text-text-ondark">
                          Cash on Delivery (COD)
                        </span>
                      </div>
                      {paymentMethod === 'COD' && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent-brass text-bg-primary">
                          <Check size={11} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-text-ondark/60 leading-relaxed font-light">
                      Pay with cash upon physical delivery at your doorstep.
                    </p>
                    <span className="text-[9px] uppercase tracking-wider text-accent-brass font-mono">
                      ● Pay on Delivery
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Action Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent-brass py-4 text-xs uppercase tracking-[0.25em] font-medium text-bg-primary hover:bg-accent-brass-hover transition-colors flex items-center justify-center gap-3 disabled:opacity-50 rounded-md shadow-md cursor-pointer"
                >
                  {paymentMethod === 'COD' ? <Truck size={15} /> : <Lock size={14} />}
                  {loading
                    ? paymentMethod === 'COD'
                      ? 'Placing Cash on Delivery Order...'
                      : 'Connecting to Secured Gateway...'
                    : paymentMethod === 'COD'
                    ? `Place Cash on Delivery Order (₹${grandTotal.toLocaleString('en-IN')})`
                    : `${content.checkout.payNow} (₹${grandTotal.toLocaleString('en-IN')})`}
                </button>
                <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-text-ondark/50">
                  <ShieldCheck size={14} className="text-accent-brass" />
                  <span>
                    {paymentMethod === 'COD'
                      ? 'No advance payment needed — Pay upon courier receipt'
                      : `${content.checkout.securePayment} — 256-bit encrypted`}
                  </span>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 border border-hairline bg-bg-deep/80 backdrop-blur-md p-6 lg:p-8 space-y-6 rounded-lg">
              <h2 className="font-serif text-xl font-light text-text-ondark border-b border-hairline pb-4">
                {content.checkout.orderSummaryTitle}
              </h2>

              {/* Items List */}
              <div className="divide-y divide-hairline space-y-4 max-h-72 overflow-y-auto pr-2">
                {cart.items.map((item) => (
                  <div key={item.id} className="pt-4 first:pt-0 flex gap-4 items-center">
                    <div className="relative h-16 w-14 shrink-0 border border-hairline bg-bg-primary overflow-hidden rounded-md">
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        sizes="60px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-xs font-light text-text-ondark truncate">
                        {item.productName}
                      </h4>
                      <p className="text-[10px] text-text-ondark/50 font-light">
                        Qty: {item.quantity} {item.size ? `• Size: ${item.size}` : ''}
                      </p>
                    </div>
                    <span className="text-xs font-serif font-light text-text-ondark">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2.5 pt-4 border-t border-hairline text-xs font-light">
                <div className="flex justify-between text-text-ondark/70">
                  <span>Subtotal</span>
                  <span className="font-mono">
                    ₹{cart.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-text-ondark/70">
                  <span>Shipping</span>
                  <span className="font-mono">
                    {shippingFee === 0 ? (
                      <span className="text-accent-brass font-sans">FREE</span>
                    ) : (
                      `₹${shippingFee.toLocaleString('en-IN')}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-text-ondark/70">
                  <span>Taxes</span>
                  <span className="text-text-ondark/40">Included</span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-hairline flex justify-between items-baseline">
                <span className="text-xs uppercase tracking-[0.2em] font-medium text-text-ondark">
                  Total Due
                </span>
                <span className="font-serif text-2xl font-light text-accent-brass">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
