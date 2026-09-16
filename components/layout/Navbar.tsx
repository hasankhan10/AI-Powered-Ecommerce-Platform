'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Search, User, Menu, X } from 'lucide-react';
import { brandConfig } from '@/config/brand.config';
import { content } from '@/config/content';
import { useCartStore } from '@/lib/store/useCartStore';
import { useSearchStore } from '@/lib/store/useSearchStore';
import { createClient } from '@/lib/supabase/client';

interface NavbarProps {
  onOpenAuth?: () => void;
  onOpenCart?: () => void;
  onOpenSearch?: () => void;
  cartCount?: number;
}

export function Navbar({
  onOpenAuth,
  onOpenCart,
  onOpenSearch,
  cartCount: propCartCount,
}: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openCart, cart, fetchCart } = useCartStore();
  const { openSearch } = useSearchStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const activeCartCount = propCartCount !== undefined ? propCartCount : cart.totalCount;
  const handleCartClick = onOpenCart || openCart;
  const handleSearchClick = onOpenSearch || openSearch;

  const handleAccountClick = async () => {
    if (onOpenAuth) {
      onOpenAuth();
      return;
    }

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Check role
      const verifyRes = await fetch(`/api/admin/verify-role?email=${encodeURIComponent(user.email || '')}`);

      if (verifyRes.ok) {
        const verifyData = await verifyRes.json();
        if (verifyData.admin) {
          router.push('/admin');
          return;
        }
      }

      router.push('/account');
    } catch {
      router.push('/login');
    }
  };

  const isHomeActive = pathname === '/';
  const isShopActive = pathname === '/shop' || pathname.startsWith('/shop/') || pathname.startsWith('/product/');
  const isCollectionsActive = pathname === '/collections' || pathname.startsWith('/collections/');
  const isStoryActive = pathname === '/story' || pathname.startsWith('/story/');
  const isAccountActive = pathname.startsWith('/account') || pathname.startsWith('/login') || pathname.startsWith('/signup');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-hairline bg-bg-primary/85 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-12">
        {/* Left: Brand Logo & Mobile trigger */}
        <div className="flex items-center gap-4">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-text-ondark/80 hover:text-accent-brass md:hidden focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Brand Logo */}
          <Link href="/" className="group flex flex-col items-start">
            <span className="font-serif text-2xl md:text-3xl font-light tracking-[0.15em] text-text-ondark group-hover:text-accent-brass transition-colors duration-300">
              {brandConfig.name.toUpperCase()}
            </span>
            <span className="text-[9px] uppercase tracking-[0.3em] text-accent-brass/80 font-sans font-medium mt-0.5">
              {brandConfig.tagline}
            </span>
          </Link>
        </div>

        {/* Center: Navigation links (Desktop) */}
        <nav className="hidden items-center space-x-8 md:flex">
          <Link
            href="/"
            className={`relative py-1 text-xs uppercase tracking-[0.2em] transition-colors duration-200 ${
              isHomeActive
                ? 'text-accent-brass font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-accent-brass after:rounded-full'
                : 'text-text-ondark/70 hover:text-accent-brass'
            }`}
          >
            {content.nav.homeLabel}
          </Link>
          <Link
            href="/shop"
            className={`relative py-1 text-xs uppercase tracking-[0.2em] transition-colors duration-200 ${
              isShopActive
                ? 'text-accent-brass font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-accent-brass after:rounded-full'
                : 'text-text-ondark/70 hover:text-accent-brass'
            }`}
          >
            {content.nav.shopLabel}
          </Link>
          <Link
            href="/collections"
            className={`relative py-1 text-xs uppercase tracking-[0.2em] transition-colors duration-200 ${
              isCollectionsActive
                ? 'text-accent-brass font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-accent-brass after:rounded-full'
                : 'text-text-ondark/70 hover:text-accent-brass'
            }`}
          >
            {content.nav.collectionsLabel}
          </Link>
          <Link
            href="/story"
            className={`relative py-1 text-xs uppercase tracking-[0.2em] transition-colors duration-200 ${
              isStoryActive
                ? 'text-accent-brass font-medium after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-accent-brass after:rounded-full'
                : 'text-text-ondark/70 hover:text-accent-brass'
            }`}
          >
            {content.nav.storyLabel}
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center space-x-6">
          <button
            onClick={() => handleSearchClick()}
            className="flex items-center gap-2 text-text-ondark/80 hover:text-accent-brass transition-colors duration-200 text-xs tracking-wider cursor-pointer"
            aria-label={content.nav.searchLabel}
          >
            <Search size={18} />
            <span className="hidden lg:inline uppercase text-[10px] tracking-[0.2em]">
              {content.nav.searchLabel}
            </span>
          </button>

          <button
            onClick={handleAccountClick}
            className={`flex items-center gap-2 transition-colors duration-200 text-xs tracking-wider cursor-pointer ${
              isAccountActive
                ? 'text-accent-brass font-medium'
                : 'text-text-ondark/80 hover:text-accent-brass'
            }`}
            aria-label={content.nav.accountLabel}
          >
            <User size={18} />
            <span className="hidden lg:inline uppercase text-[10px] tracking-[0.2em]">
              {content.nav.accountLabel}
            </span>
          </button>

          <button
            onClick={handleCartClick}
            className="relative flex items-center gap-2 text-text-ondark hover:text-accent-brass transition-colors duration-200 cursor-pointer"
            aria-label={content.nav.cartLabel}
          >
            <ShoppingBag size={18} />
            {activeCartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent-brass text-[9px] font-bold text-bg-primary">
                {activeCartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-hairline bg-bg-deep px-6 py-8 md:hidden animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-6">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openSearch();
              }}
              className="text-sm uppercase tracking-[0.25em] text-text-ondark/90 hover:text-accent-brass flex items-center gap-2 text-left"
            >
              <Search size={16} />
              <span>Search (Cmd+K)</span>
            </button>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm uppercase tracking-[0.25em] transition-colors ${
                isHomeActive
                  ? 'text-accent-brass font-medium pl-3 border-l-2 border-accent-brass'
                  : 'text-text-ondark/90 hover:text-accent-brass'
              }`}
            >
              {content.nav.homeLabel}
            </Link>
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm uppercase tracking-[0.25em] transition-colors ${
                isShopActive
                  ? 'text-accent-brass font-medium pl-3 border-l-2 border-accent-brass'
                  : 'text-text-ondark/90 hover:text-accent-brass'
              }`}
            >
              {content.nav.shopLabel}
            </Link>
            <Link
              href="/collections"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm uppercase tracking-[0.25em] transition-colors ${
                isCollectionsActive
                  ? 'text-accent-brass font-medium pl-3 border-l-2 border-accent-brass'
                  : 'text-text-ondark/90 hover:text-accent-brass'
              }`}
            >
              {content.nav.collectionsLabel}
            </Link>
            <Link
              href="/story"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-sm uppercase tracking-[0.25em] transition-colors ${
                isStoryActive
                  ? 'text-accent-brass font-medium pl-3 border-l-2 border-accent-brass'
                  : 'text-text-ondark/90 hover:text-accent-brass'
              }`}
            >
              {content.nav.storyLabel}
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleAccountClick();
              }}
              className={`text-sm uppercase tracking-[0.25em] transition-colors flex items-center gap-2 text-left ${
                isAccountActive
                  ? 'text-accent-brass font-medium pl-3 border-l-2 border-accent-brass'
                  : 'text-text-ondark/90 hover:text-accent-brass'
              }`}
            >
              <User size={16} />
              <span>{content.nav.accountLabel}</span>
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
