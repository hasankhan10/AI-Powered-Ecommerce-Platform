'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Package,
  MapPin,
  LogOut,
  ShoppingBag,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Lock,
  Eye,
  EyeOff,
  Check,
  Home,
  Building,
  ShieldCheck,
  Shield,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { brandConfig } from '@/config/brand.config';
import { content } from '@/config/content';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { UserAddress } from '@/lib/types/address';
import { AccountSkeleton } from '@/components/ui/Skeleton';
import { LuxuryLoader } from '@/components/ui/LuxuryLoader';

interface OrderItem {
  id: string;
  productName: string;
  size?: string;
  color?: string;
  quantity: number;
  price: number;
}

interface OrderSummary {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  total: number;
  itemsCount: number;
  items?: OrderItem[];
}

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses' | 'security'>('orders');

  // Orders State
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const [profileErrorMsg, setProfileErrorMsg] = useState<string | null>(null);

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null);

  // Addresses State
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressMsg, setAddressMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Address Form Fields
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push('/login?redirectTo=/account');
        return;
      }

      // Check if user is an Administrator
      try {
        const verifyRes = await fetch(`/api/admin/verify-role?email=${encodeURIComponent(authUser.email || '')}`);
        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          if (verifyData.admin) {
            window.location.href = '/admin';
            return;
          }
        }
      } catch (e) {
        console.warn('Role verification check:', e);
      }

      setUser(authUser);
      setFullName(authUser.user_metadata?.full_name || authUser.user_metadata?.name || '');
      setPhone(authUser.user_metadata?.phone || '');

      const userAddrs: UserAddress[] = authUser.user_metadata?.addresses || [];
      setAddresses(userAddrs);

      // Fetch customer orders
      fetchOrders(authUser.email || '');
      setLoading(false);
    }

    loadUser();
  }, [router, supabase]);

  const fetchOrders = async (email: string) => {
    if (!email) return;
    setOrdersLoading(true);
    try {
      const res = await fetch(`/api/customer/orders?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error('Failed to fetch orders:', e);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  // 1. Update Profile (Name & Phone)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccessMsg(null);
    setProfileErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          name: fullName.trim(),
          phone: phone.trim(),
        },
      });

      if (error) throw error;

      setUser(data.user);
      setIsEditingProfile(false);
      setProfileSuccessMsg('Your personal details have been updated successfully.');
      setTimeout(() => setProfileSuccessMsg(null), 4000);
    } catch (err: any) {
      setProfileErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  // 2. Update Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('Passwords do not match.');
      return;
    }

    setPasswordSaving(true);
    setPasswordSuccessMsg(null);
    setPasswordErrorMsg(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPasswordSuccessMsg('Your password has been updated successfully.');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccessMsg(null), 4000);
    } catch (err: any) {
      setPasswordErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  // 3. Address Management
  const openNewAddressModal = () => {
    setEditingAddressId(null);
    setAddrName(fullName || '');
    setAddrPhone(phone || '');
    setAddrLine1('');
    setAddrLine2('');
    setAddrCity('');
    setAddrState('');
    setAddrPincode('');
    setAddrIsDefault(addresses.length === 0);
    setShowAddressModal(true);
    setAddressMsg(null);
  };

  const openEditAddressModal = (addr: UserAddress) => {
    setEditingAddressId(addr.id);
    setAddrName(addr.name);
    setAddrPhone(addr.phone);
    setAddrLine1(addr.line1);
    setAddrLine2(addr.line2 || '');
    setAddrCity(addr.city);
    setAddrState(addr.state);
    setAddrPincode(addr.pincode);
    setAddrIsDefault(!!addr.isDefault);
    setShowAddressModal(true);
    setAddressMsg(null);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName || !addrPhone || !addrLine1 || !addrCity || !addrState || !addrPincode) {
      setAddressMsg({ type: 'error', text: 'Please complete all required address fields.' });
      return;
    }

    setAddressSaving(true);
    setAddressMsg(null);

    try {
      let updatedAddrs: UserAddress[];

      if (editingAddressId) {
        // Edit existing
        updatedAddrs = addresses.map((a) => {
          if (a.id === editingAddressId) {
            return {
              ...a,
              name: addrName.trim(),
              phone: addrPhone.trim(),
              line1: addrLine1.trim(),
              line2: addrLine2.trim() || undefined,
              city: addrCity.trim(),
              state: addrState.trim(),
              pincode: addrPincode.trim(),
              isDefault: addrIsDefault,
            };
          }
          return addrIsDefault ? { ...a, isDefault: false } : a;
        });
      } else {
        // Add new
        const newAddr: UserAddress = {
          id: 'addr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          name: addrName.trim(),
          phone: addrPhone.trim(),
          line1: addrLine1.trim(),
          line2: addrLine2.trim() || undefined,
          city: addrCity.trim(),
          state: addrState.trim(),
          pincode: addrPincode.trim(),
          country: 'India',
          isDefault: addrIsDefault || addresses.length === 0,
        };

        if (newAddr.isDefault) {
          updatedAddrs = [...addresses.map((a) => ({ ...a, isDefault: false })), newAddr];
        } else {
          updatedAddrs = [...addresses, newAddr];
        }
      }

      const { data, error } = await supabase.auth.updateUser({
        data: {
          addresses: updatedAddrs,
        },
      });

      if (error) throw error;

      setAddresses(updatedAddrs);
      setUser(data.user);
      setShowAddressModal(false);
      setAddressMsg({ type: 'success', text: 'Address saved successfully.' });
      setTimeout(() => setAddressMsg(null), 3500);
    } catch (err: any) {
      setAddressMsg({ type: 'error', text: err.message || 'Failed to save address.' });
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to remove this address?')) return;

    try {
      const updatedAddrs = addresses.filter((a) => a.id !== id);
      // If deleted address was default and others exist, set first as default
      if (addresses.find((a) => a.id === id)?.isDefault && updatedAddrs.length > 0) {
        updatedAddrs[0].isDefault = true;
      }

      const { data, error } = await supabase.auth.updateUser({
        data: {
          addresses: updatedAddrs,
        },
      });

      if (error) throw error;

      setAddresses(updatedAddrs);
      setUser(data.user);
      setAddressMsg({ type: 'success', text: 'Address removed.' });
      setTimeout(() => setAddressMsg(null), 3000);
    } catch (err: any) {
      setAddressMsg({ type: 'error', text: err.message || 'Failed to delete address.' });
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const updatedAddrs = addresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }));

      const { data, error } = await supabase.auth.updateUser({
        data: {
          addresses: updatedAddrs,
        },
      });

      if (error) throw error;

      setAddresses(updatedAddrs);
      setUser(data.user);
    } catch (err: any) {
      console.error('Failed to set default address:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-bg-primary text-text-ondark">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-12 py-12 lg:py-16">
          <AccountSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  const patronDisplayName = fullName || user?.email?.split('@')[0] || 'Discerning Patron';
  const userEmail = user?.email || '';

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-ondark">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 lg:px-12 py-12 lg:py-16">
        {/* Header section */}
        <div className="border-b border-hairline pb-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.3em] text-accent-brass font-medium">
                Patron Sanctuary
              </span>
              <span className="h-1 w-1 rounded-full bg-accent-brass/50" />
              <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-mono">
                Verified Member
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-text-ondark tracking-tight">
              Welcome, {patronDisplayName}
            </h1>
            <p className="text-xs text-text-ondark/60 font-light">
              Connected as <span className="font-mono text-text-ondark/90">{userEmail}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="px-5 py-2.5 bg-accent-brass text-bg-primary text-xs uppercase tracking-[0.2em] font-medium hover:bg-accent-brass-hover transition-colors rounded-md shadow-sm inline-flex items-center gap-2"
            >
              <ShoppingBag size={14} />
              <span>Explore Collection</span>
            </Link>

            <button
              onClick={handleSignOut}
              className="px-4 py-2.5 border border-hairline text-text-ondark/70 hover:text-red-400 hover:border-red-500/40 text-xs uppercase tracking-wider transition-colors rounded-md inline-flex items-center gap-1.5"
            >
              <LogOut size={13} />
              <span>{content.nav.signOutLabel}</span>
            </button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Navigation Tabs (Sidebar) */}
          <div className="lg:col-span-3 space-y-2">
            <div className="border border-hairline bg-bg-deep p-2 rounded-lg space-y-1">
              {/* 1. Orders Tab */}
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center justify-between p-3 rounded-md text-xs tracking-wider transition-all text-left ${
                  activeTab === 'orders'
                    ? 'bg-accent-brass/15 text-accent-brass font-medium border border-accent-brass/30'
                    : 'text-text-ondark/70 hover:text-text-ondark hover:bg-bg-primary/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package size={15} />
                  <span>{content.account.ordersLabel}</span>
                </div>
                <ChevronRight size={13} className="opacity-50" />
              </button>

              {/* 2. Profile Tab */}
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center justify-between p-3 rounded-md text-xs tracking-wider transition-all text-left ${
                  activeTab === 'profile'
                    ? 'bg-accent-brass/15 text-accent-brass font-medium border border-accent-brass/30'
                    : 'text-text-ondark/70 hover:text-text-ondark hover:bg-bg-primary/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <User size={15} />
                  <span>{content.account.profileLabel}</span>
                </div>
                <ChevronRight size={13} className="opacity-50" />
              </button>

              {/* 3. Addresses Tab */}
              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center justify-between p-3 rounded-md text-xs tracking-wider transition-all text-left ${
                  activeTab === 'addresses'
                    ? 'bg-accent-brass/15 text-accent-brass font-medium border border-accent-brass/30'
                    : 'text-text-ondark/70 hover:text-text-ondark hover:bg-bg-primary/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MapPin size={15} />
                  <span>Saved Addresses</span>
                </div>
                <ChevronRight size={13} className="opacity-50" />
              </button>

              {/* 4. Security Tab */}
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center justify-between p-3 rounded-md text-xs tracking-wider transition-all text-left ${
                  activeTab === 'security'
                    ? 'bg-accent-brass/15 text-accent-brass font-medium border border-accent-brass/30'
                    : 'text-text-ondark/70 hover:text-text-ondark hover:bg-bg-primary/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Lock size={15} />
                  <span>Password & Security</span>
                </div>
                <ChevronRight size={13} className="opacity-50" />
              </button>
            </div>
          </div>

          {/* Main Tab Content */}
          <div className="lg:col-span-9">
            {/* 1. Orders Tab Content */}
            {activeTab === 'orders' && (
              <div className="border border-hairline bg-bg-deep p-6 sm:p-8 rounded-lg space-y-6">
                <div className="flex items-center justify-between border-b border-hairline/60 pb-4">
                  <div>
                    <h3 className="font-serif text-xl text-text-ondark font-light">
                      {content.account.ordersLabel}
                    </h3>
                    <p className="text-xs text-text-ondark/60 font-light mt-0.5">
                      Track past formulation acquisitions and delivery updates.
                    </p>
                  </div>
                </div>

                {ordersLoading ? (
                  <div className="py-12 text-center text-xs text-text-ondark/50">
                    Loading your orders...
                  </div>
                ) : orders.length === 0 ? (
                  <div className="py-16 text-center space-y-4">
                    <div className="h-12 w-12 mx-auto rounded-full bg-bg-primary border border-hairline flex items-center justify-center text-accent-brass/60">
                      <Package size={22} />
                    </div>
                    <div className="space-y-1 max-w-sm mx-auto">
                      <h4 className="font-serif text-lg text-text-ondark font-light">
                        {content.account.noOrders}
                      </h4>
                      <p className="text-xs text-text-ondark/60 font-light">
                        When you acquire pieces from our collections, your order tracking and receipts will appear here.
                      </p>
                    </div>
                    <Link
                      href="/shop"
                      className="inline-flex items-center gap-2 bg-accent-brass px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-medium text-bg-primary hover:bg-accent-brass-hover transition-colors rounded-md shadow-sm mt-2"
                    >
                      <ShoppingBag size={14} />
                      <span>Discover the Collection</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="border border-hairline bg-bg-primary p-5 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-text-ondark font-medium">
                              #{ord.orderNumber}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-accent-brass/10 text-accent-brass border border-accent-brass/30">
                              {ord.status}
                            </span>
                          </div>
                          <p className="text-xs text-text-ondark/60 font-light">
                            {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                          {ord.items && ord.items.length > 0 && (
                            <p className="text-[11px] text-text-ondark/50">
                              {ord.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-serif text-base text-text-ondark">
                            ₹{ord.total.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. Profile Tab Content (Personal Information) */}
            {activeTab === 'profile' && (
              <div className="border border-hairline bg-bg-deep p-6 sm:p-8 rounded-lg space-y-6">
                {profileSuccessMsg && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 rounded">
                    <CheckCircle2 size={15} />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}

                {profileErrorMsg && (
                  <div className="p-3 bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 rounded">
                    <AlertCircle size={15} />
                    <span>{profileErrorMsg}</span>
                  </div>
                )}

                {!isEditingProfile ? (
                  /* Read-only Information View */
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-hairline/60 pb-4 gap-4">
                      <div>
                        <h3 className="font-serif text-xl text-text-ondark font-light">
                          Personal Information
                        </h3>
                        <p className="text-xs text-text-ondark/60 font-light mt-0.5">
                          Your verified identity and contact details.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingProfile(true);
                          setProfileErrorMsg(null);
                          setProfileSuccessMsg(null);
                        }}
                        className="px-4 py-2 border border-hairline hover:border-accent-brass hover:text-accent-brass text-xs uppercase tracking-wider rounded transition-colors inline-flex items-center gap-2 font-medium"
                      >
                        <Edit2 size={13} />
                        <span>Edit Details</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                      <div className="p-4 border border-hairline/60 bg-bg-primary/50 rounded-lg space-y-1">
                        <span className="text-[10px] uppercase tracking-wider text-text-ondark/50 block">
                          Full Name
                        </span>
                        <p className="text-sm font-serif text-text-ondark font-normal">
                          {fullName || 'Not provided'}
                        </p>
                      </div>

                      <div className="p-4 border border-hairline/60 bg-bg-primary/50 rounded-lg space-y-1">
                        <span className="text-[10px] uppercase tracking-wider text-text-ondark/50 block">
                          Email Address
                        </span>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-mono text-text-ondark truncate">
                            {userEmail}
                          </p>
                          <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-[9px] uppercase tracking-wider text-emerald-400 rounded">
                            Verified
                          </span>
                        </div>
                      </div>

                      <div className="p-4 border border-hairline/60 bg-bg-primary/50 rounded-lg space-y-1">
                        <span className="text-[10px] uppercase tracking-wider text-text-ondark/50 block">
                          Phone Number
                        </span>
                        <p className="text-sm font-mono text-text-ondark">
                          {phone || 'Not provided'}
                        </p>
                      </div>

                      <div className="p-4 border border-hairline/60 bg-bg-primary/50 rounded-lg space-y-1">
                        <span className="text-[10px] uppercase tracking-wider text-text-ondark/50 block">
                          Patron Status
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-accent-brass animate-pulse" />
                          <p className="text-xs uppercase tracking-wider text-accent-brass font-medium">
                            Active Member
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Edit Mode Form */
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-hairline/60 pb-4 gap-4">
                      <div>
                        <h3 className="font-serif text-xl text-text-ondark font-light">
                          Edit Personal Details
                        </h3>
                        <p className="text-xs text-text-ondark/60 font-light mt-0.5">
                          Update your name and primary contact details.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfileErrorMsg(null);
                        }}
                        className="px-4 py-2 text-xs text-text-ondark/60 hover:text-text-ondark transition-colors"
                      >
                        Cancel
                      </button>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Ananya Sharma"
                            className="w-full border border-hairline bg-bg-primary px-3.5 py-2.5 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none rounded"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full border border-hairline bg-bg-primary px-3.5 py-2.5 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none rounded font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                          Email Address
                        </label>
                        <input
                          type="email"
                          disabled
                          value={userEmail}
                          className="w-full border border-hairline bg-bg-primary/50 px-3.5 py-2.5 text-xs text-text-ondark/60 font-mono rounded cursor-not-allowed"
                        />
                        <p className="text-[10px] text-text-ondark/40">
                          Email address is linked to your authentication credentials.
                        </p>
                      </div>

                      <div className="pt-2 flex items-center gap-3">
                        <button
                          type="submit"
                          disabled={profileSaving}
                          className="bg-accent-brass text-bg-primary hover:bg-accent-brass-hover px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-medium transition-colors rounded-md shadow-sm disabled:opacity-50 inline-flex items-center gap-2"
                        >
                          {profileSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingProfile(false);
                            setProfileErrorMsg(null);
                          }}
                          className="px-5 py-2.5 border border-hairline text-text-ondark/70 hover:text-text-ondark text-xs uppercase tracking-wider rounded transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* 3. Password & Security Tab Content */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="border border-hairline bg-bg-deep p-6 sm:p-8 rounded-lg space-y-6">
                  <div className="border-b border-hairline/60 pb-4">
                    <h3 className="font-serif text-xl text-text-ondark font-light">
                      Password & Security
                    </h3>
                    <p className="text-xs text-text-ondark/60 font-light mt-0.5">
                      Change your account credentials to keep your patron account secure.
                    </p>
                  </div>

                  {passwordSuccessMsg && (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 rounded">
                      <CheckCircle2 size={15} />
                      <span>{passwordSuccessMsg}</span>
                    </div>
                  )}

                  {passwordErrorMsg && (
                    <div className="p-3 bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2 rounded">
                      <AlertCircle size={15} />
                      <span>{passwordErrorMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdatePassword} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                          New Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={6}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            className="w-full border border-hairline bg-bg-primary px-3.5 py-2.5 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none rounded pr-9"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-text-ondark/40 hover:text-text-ondark"
                          >
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                          Confirm New Password *
                        </label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full border border-hairline bg-bg-primary px-3.5 py-2.5 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none rounded"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={passwordSaving || !newPassword}
                        className="bg-accent-brass text-bg-primary hover:bg-accent-brass-hover px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-medium transition-colors rounded-md shadow-sm disabled:opacity-50 inline-flex items-center gap-2"
                      >
                        <Lock size={13} />
                        <span>{passwordSaving ? 'Updating...' : 'Update Password'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Security Badge & Information */}
                <div className="border border-hairline/60 bg-bg-deep/50 p-5 rounded-lg flex items-start gap-4">
                  <div className="p-2.5 bg-accent-brass/10 border border-accent-brass/30 text-accent-brass rounded-md shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="space-y-1 text-xs font-light text-text-ondark/70">
                    <h4 className="text-text-ondark font-medium uppercase tracking-wider text-[11px]">
                      Account Security Assurance
                    </h4>
                    <p className="leading-relaxed">
                      Your authentication credentials and transactions are encrypted with 256-bit SSL protocols. Always choose a unique password not used elsewhere.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Addresses Tab Content */}
            {activeTab === 'addresses' && (
              <div className="border border-hairline bg-bg-deep p-6 sm:p-8 rounded-lg space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-hairline/60 pb-4 gap-4">
                  <div>
                    <h3 className="font-serif text-xl text-text-ondark font-light">
                      Saved Shipping Addresses
                    </h3>
                    <p className="text-xs text-text-ondark/60 font-light mt-0.5">
                      Manage delivery destinations. These addresses can be selected with one click during checkout.
                    </p>
                  </div>
                  <button
                    onClick={openNewAddressModal}
                    className="bg-accent-brass text-bg-primary hover:bg-accent-brass-hover px-4 py-2 text-xs uppercase tracking-wider font-medium transition-colors rounded-md inline-flex items-center gap-1.5 shadow-sm shrink-0"
                  >
                    <Plus size={14} />
                    <span>Add New Address</span>
                  </button>
                </div>

                {addressMsg && (
                  <div
                    className={`p-3 text-xs flex items-center gap-2 rounded border ${
                      addressMsg.type === 'success'
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-red-950/40 border-red-500/40 text-red-300'
                    }`}
                  >
                    {addressMsg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                    <span>{addressMsg.text}</span>
                  </div>
                )}

                {addresses.length === 0 ? (
                  <div className="py-16 text-center space-y-4">
                    <div className="h-12 w-12 mx-auto rounded-full bg-bg-primary border border-hairline flex items-center justify-center text-accent-brass/60">
                      <MapPin size={22} />
                    </div>
                    <div className="space-y-1 max-w-sm mx-auto">
                      <h4 className="font-serif text-lg text-text-ondark font-light">
                        No Addresses Saved Yet
                      </h4>
                      <p className="text-xs text-text-ondark/60 font-light">
                        Add a shipping address to enjoy accelerated, 1-click checkout on your next acquisition.
                      </p>
                    </div>
                    <button
                      onClick={openNewAddressModal}
                      className="inline-flex items-center gap-1.5 bg-accent-brass px-5 py-2.5 text-xs uppercase tracking-[0.15em] font-medium text-bg-primary hover:bg-accent-brass-hover transition-colors rounded-md shadow-sm mt-2"
                    >
                      <Plus size={14} />
                      <span>Add Address</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`p-5 rounded-lg border transition-all relative flex flex-col justify-between ${
                          addr.isDefault
                            ? 'border-accent-brass/60 bg-accent-brass/5 shadow-sm'
                            : 'border-hairline bg-bg-primary'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-text-ondark">
                              {addr.name}
                            </span>
                            {addr.isDefault && (
                              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-accent-brass text-bg-primary font-semibold">
                                Default
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-text-ondark/75 font-light leading-relaxed space-y-0.5">
                            <p>{addr.line1}</p>
                            {addr.line2 && <p>{addr.line2}</p>}
                            <p>
                              {addr.city}, {addr.state} — <span className="font-mono">{addr.pincode}</span>
                            </p>
                            <p>{addr.country || 'India'}</p>
                            <p className="font-mono text-[11px] text-text-ondark/50 pt-1">
                              Phone: {addr.phone}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-hairline/60">
                          <div>
                            {!addr.isDefault && (
                              <button
                                onClick={() => handleSetDefaultAddress(addr.id)}
                                className="text-[11px] text-accent-brass hover:underline"
                              >
                                Set as Default
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditAddressModal(addr)}
                              className="p-1.5 border border-hairline hover:border-accent-brass hover:text-accent-brass transition-colors rounded"
                              title="Edit Address"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="p-1.5 border border-hairline hover:border-red-500 hover:text-red-400 transition-colors rounded"
                              title="Delete Address"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Address Form Modal */}
      {showAddressModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onWheel={(e) => e.stopPropagation()}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg border border-hairline bg-bg-primary text-text-ondark shadow-2xl p-6 rounded-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="border-b border-hairline pb-4 mb-5">
              <h3 className="font-serif text-xl font-light text-text-ondark">
                {editingAddressId ? 'Edit Address' : 'Add New Address'}
              </h3>
              <p className="text-xs text-text-ondark/60 font-light mt-0.5">
                Saved addresses can be selected directly on checkout.
              </p>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                    Recipient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addrName}
                    onChange={(e) => setAddrName(e.target.value)}
                    placeholder="e.g. Ananya Sharma"
                    className="w-full border border-hairline bg-bg-deep px-3 py-2 text-xs text-text-ondark focus:border-accent-brass focus:outline-none rounded"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                    Contact Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full border border-hairline bg-bg-deep px-3 py-2 text-xs text-text-ondark focus:border-accent-brass focus:outline-none rounded font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                  Street Address / Flat / Building *
                </label>
                <input
                  type="text"
                  required
                  value={addrLine1}
                  onChange={(e) => setAddrLine1(e.target.value)}
                  placeholder="e.g. Flat 402, Lotus Grand, 14th Main Road"
                  className="w-full border border-hairline bg-bg-deep px-3 py-2 text-xs text-text-ondark focus:border-accent-brass focus:outline-none rounded"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                  Apartment / Area / Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={addrLine2}
                  onChange={(e) => setAddrLine2(e.target.value)}
                  placeholder="e.g. Near Defense Colony Park"
                  className="w-full border border-hairline bg-bg-deep px-3 py-2 text-xs text-text-ondark focus:border-accent-brass focus:outline-none rounded"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full border border-hairline bg-bg-deep px-3 py-2 text-xs text-text-ondark focus:border-accent-brass focus:outline-none rounded"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={addrState}
                    onChange={(e) => setAddrState(e.target.value)}
                    placeholder="e.g. Maharashtra"
                    className="w-full border border-hairline bg-bg-deep px-3 py-2 text-xs text-text-ondark focus:border-accent-brass focus:outline-none rounded"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] uppercase tracking-wider text-text-ondark/70">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={addrPincode}
                    onChange={(e) => setAddrPincode(e.target.value)}
                    placeholder="400001"
                    className="w-full border border-hairline bg-bg-deep px-3 py-2 text-xs text-text-ondark focus:border-accent-brass focus:outline-none rounded font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="default-check"
                  checked={addrIsDefault}
                  onChange={(e) => setAddrIsDefault(e.target.checked)}
                  className="rounded border-hairline text-accent-brass focus:ring-accent-brass"
                />
                <label htmlFor="default-check" className="text-xs text-text-ondark/80 cursor-pointer">
                  Set as default delivery address
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-hairline">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 border border-hairline text-xs uppercase tracking-wider text-text-ondark/70 hover:border-text-ondark rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressSaving}
                  className="bg-accent-brass text-bg-primary hover:bg-accent-brass-hover px-6 py-2 text-xs uppercase tracking-wider font-medium rounded shadow-sm disabled:opacity-50"
                >
                  {addressSaving ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
