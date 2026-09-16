'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { UserAddress } from '@/lib/types/address';
import { AccountSkeleton } from '@/components/ui/Skeleton';
import { AccountHeader } from '@/components/account/AccountHeader';
import { AccountSidebarNav, AccountTabKey } from '@/components/account/AccountSidebarNav';
import { AccountOrdersTab, OrderSummary } from '@/components/account/AccountOrdersTab';
import { AccountProfileTab } from '@/components/account/AccountProfileTab';
import { AccountAddressesTab } from '@/components/account/AccountAddressesTab';
import { AccountSecurityTab } from '@/components/account/AccountSecurityTab';

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AccountTabKey>('orders');

  // Orders State
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Profile Details State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addresses, setAddresses] = useState<UserAddress[]>([]);

  const fetchOrders = useCallback(async (email: string) => {
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
  }, []);

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

      // Admin verification check
      try {
        const verifyRes = await fetch(
          `/api/admin/verify-role?email=${encodeURIComponent(authUser.email || '')}`
        );
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
      setAddresses(authUser.user_metadata?.addresses || []);

      fetchOrders(authUser.email || '');
      setLoading(false);
    }

    loadUser();
  }, [router, supabase, fetchOrders]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  // 1. Update Profile (Name & Phone)
  const handleUpdateProfile = async (name: string, phoneNum: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: name.trim(),
          name: name.trim(),
          phone: phoneNum.trim(),
        },
      });

      if (error) throw error;
      setUser(data.user);
      setFullName(name.trim());
      setPhone(phoneNum.trim());
      return true;
    } catch (err) {
      console.error('Failed to update profile:', err);
      return false;
    }
  };

  // 2. Update Password
  const handleUpdatePassword = async (newPassword: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Failed to update password:', err);
      return false;
    }
  };

  // 3. Save Address (Add or Edit)
  const handleSaveAddress = async (
    addressData: Omit<UserAddress, 'id'>,
    editId?: string
  ): Promise<boolean> => {
    try {
      let updatedAddrs: UserAddress[];

      if (editId) {
        updatedAddrs = addresses.map((a) => {
          if (a.id === editId) {
            return { ...a, ...addressData };
          }
          return addressData.isDefault ? { ...a, isDefault: false } : a;
        });
      } else {
        const newAddr: UserAddress = {
          ...addressData,
          id: 'addr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          isDefault: addressData.isDefault || addresses.length === 0,
        };
        if (newAddr.isDefault) {
          updatedAddrs = [...addresses.map((a) => ({ ...a, isDefault: false })), newAddr];
        } else {
          updatedAddrs = [...addresses, newAddr];
        }
      }

      const { data, error } = await supabase.auth.updateUser({
        data: { addresses: updatedAddrs },
      });

      if (error) throw error;
      setAddresses(updatedAddrs);
      setUser(data.user);
      return true;
    } catch (err) {
      console.error('Failed to save address:', err);
      return false;
    }
  };

  // 4. Delete Address
  const handleDeleteAddress = async (id: string): Promise<boolean> => {
    try {
      const updatedAddrs = addresses.filter((a) => a.id !== id);
      if (addresses.find((a) => a.id === id)?.isDefault && updatedAddrs.length > 0) {
        updatedAddrs[0].isDefault = true;
      }

      const { data, error } = await supabase.auth.updateUser({
        data: { addresses: updatedAddrs },
      });

      if (error) throw error;
      setAddresses(updatedAddrs);
      setUser(data.user);
      return true;
    } catch (err) {
      console.error('Failed to delete address:', err);
      return false;
    }
  };

  // 5. Set Default Address
  const handleSetDefaultAddress = async (id: string): Promise<boolean> => {
    try {
      const updatedAddrs = addresses.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }));

      const { data, error } = await supabase.auth.updateUser({
        data: { addresses: updatedAddrs },
      });

      if (error) throw error;
      setAddresses(updatedAddrs);
      setUser(data.user);
      return true;
    } catch (err) {
      console.error('Failed to set default address:', err);
      return false;
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
        {/* Header Section */}
        <AccountHeader
          displayName={patronDisplayName}
          email={userEmail}
          onSignOut={handleSignOut}
        />

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Navigation Sidebar */}
          <AccountSidebarNav activeTab={activeTab} onSelectTab={setActiveTab} />

          {/* Main Tab Content */}
          <div className="lg:col-span-9">
            {activeTab === 'orders' && (
              <AccountOrdersTab orders={orders} loading={ordersLoading} />
            )}

            {activeTab === 'profile' && (
              <AccountProfileTab
                fullName={fullName}
                phone={phone}
                userEmail={userEmail}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {activeTab === 'addresses' && (
              <AccountAddressesTab
                addresses={addresses}
                defaultRecipientName={fullName}
                defaultRecipientPhone={phone}
                onSaveAddress={handleSaveAddress}
                onDeleteAddress={handleDeleteAddress}
                onSetDefaultAddress={handleSetDefaultAddress}
              />
            )}

            {activeTab === 'security' && (
              <AccountSecurityTab onUpdatePassword={handleUpdatePassword} />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
