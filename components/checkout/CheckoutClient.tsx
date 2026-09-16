'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { createClient } from '@/lib/supabase/client';
import { brandConfig } from '@/config/brand.config';
import { content } from '@/config/content';
import { UserAddress } from '@/lib/types/address';
import { toast } from '@/lib/store/useToast';
import { LuxuryLoader } from '@/components/ui/LuxuryLoader';
import { CheckoutContactSection } from './CheckoutContactSection';
import { CheckoutAddressSection } from './CheckoutAddressSection';
import { CheckoutPaymentSection } from './CheckoutPaymentSection';
import { CheckoutOrderSummary } from './CheckoutOrderSummary';

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

      if (orderData.isCOD) {
        await fetchCart();
        toast.success(`Order ${orderData.orderNumber} placed via Cash on Delivery!`, 'Order Confirmed');
        router.push(`/order-confirm?orderNumber=${orderData.orderNumber}&orderId=${orderData.orderId}&method=cod`);
        return;
      }

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
          prefill: { name, email, contact: phone },
          theme: { color: '#C6A87D' },
          handler: async function (response: any) {
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
              toast.success('Payment authorized & order confirmed!', 'Order Confirmed');
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
        // Simulated test mode verification
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
          toast.success('Order placed successfully!', 'Order Confirmed');
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
              <CheckoutContactSection
                name={name}
                email={email}
                phone={phone}
                onNameChange={setName}
                onEmailChange={setEmail}
                onPhoneChange={setPhone}
              />

              {/* Delivery Address */}
              <CheckoutAddressSection
                line1={line1}
                line2={line2}
                city={city}
                state={state}
                pincode={pincode}
                savedAddresses={savedAddresses}
                selectedAddressId={selectedAddressId}
                onLine1Change={setLine1}
                onLine2Change={setLine2}
                onCityChange={setCity}
                onStateChange={setState}
                onPincodeChange={setPincode}
                onSelectAddress={handleSelectAddress}
                onClearAddressSelection={handleClearAddressSelection}
              />

              {/* Payment Method Selection */}
              <CheckoutPaymentSection
                paymentMethod={paymentMethod}
                loading={loading}
                grandTotal={grandTotal}
                onPaymentMethodChange={setPaymentMethod}
              />
            </form>
          </div>

          {/* Right Column: Order Summary (5 cols) */}
          <CheckoutOrderSummary
            items={cart.items}
            subtotal={cart.subtotal}
            shippingFee={shippingFee}
            grandTotal={grandTotal}
          />
        </div>
      </div>
    </div>
  );
}
