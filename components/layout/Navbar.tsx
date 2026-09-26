'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Search, User, Menu, X, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openCart, cart, fetchCart } = useCartStore();
  const { openSearch } = useSearchStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Scroll listener for dynamic liquid glass transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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

  const navLinks = [
    { label: content.nav.homeLabel, href: '/', active: pathname === '/' },
    {
      label: content.nav.shopLabel,
      href: '/shop',
      active: pathname === '/shop' || pathname.startsWith('/shop/') || pathname.startsWith('/product/'),
    },
    {
      label: content.nav.collectionsLabel,
      href: '/collections',
      active: pathname === '/collections' || pathname.startsWith('/collections/'),
    },
    {
      label: content.nav.storyLabel,
      href: '/story',
      active: pathname === '/story' || pathname.startsWith('/story/'),
    },
  ];

  const isAccountActive =
    pathname.startsWith('/account') || pathname.startsWith('/login') || pathname.startsWith('/signup');

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-500 ${
        isScrolled
          ? 'border-b border-hairline/70 bg-bg-primary/85 backdrop-blur-xl shadow-2xl shadow-black/40 py-3.5'
          : 'border-b border-hairline/40 bg-bg-primary/60 backdrop-blur-md py-5'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-12">
        {/* Left: Mobile menu toggle & Brand Logotype */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Mobile hamburger trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-hairline/60 bg-bg-deep/40 text-text-ondark/80 transition-all duration-300 hover:border-accent-brass hover:bg-bg-deep hover:text-accent-brass md:hidden focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-brass"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {/* Brand Logo & Tagline */}
          <Link href="/" className="group flex flex-col items-start select-none">
            <div className="flex items-center gap-2">
              <span className="font-serif text-2xl sm:text-3xl font-light tracking-[0.18em] text-text-ondark transition-colors duration-300 group-hover:text-accent-brass">
                {brandConfig.name.toUpperCase()}
              </span>
            </div>
            <span className="text-[8.5px] sm:text-[9px] uppercase tracking-[0.32em] text-accent-brass/80 font-sans font-medium transition-colors duration-300 group-hover:text-accent-brass">
              {brandConfig.tagline}
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation Bar with Liquid Underline Indicator */}
        <nav className="hidden items-center space-x-1 lg:space-x-2 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-4 py-2 text-[11px] uppercase tracking-[0.25em] font-light transition-all duration-300 rounded-full group ${
                link.active
                  ? 'text-accent-brass font-medium'
                  : 'text-text-ondark/70 hover:text-text-ondark hover:bg-bg-deep/40'
              }`}
            >
              <span>{link.label}</span>
              {link.active && (
                <motion.div
                  layoutId="navbar-active-indicator"
                  className="absolute bottom-0 left-4 right-4 h-[1.5px] bg-gradient-to-r from-transparent via-accent-brass to-transparent rounded-full shadow-[0_0_8px_rgba(198,168,125,0.6)]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Right: Actions Suite (Search, Account, Cart) */}
        <div className="flex items-center space-x-2.5 sm:space-x-4">
          {/* Quick Search Button */}
          <button
            type="button"
            onClick={() => handleSearchClick()}
            className="group flex h-10 items-center gap-2 rounded-full border border-hairline/60 bg-bg-deep/40 px-3.5 sm:px-4 text-text-ondark/80 transition-all duration-300 hover:border-accent-brass/80 hover:bg-bg-deep hover:text-accent-brass focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-brass cursor-pointer"
            aria-label={content.nav.searchLabel}
          >
            <Search size={16} className="text-text-ondark/70 transition-transform duration-200 group-hover:scale-110 group-hover:text-accent-brass" />
            <span className="hidden lg:inline uppercase text-[9.5px] tracking-[0.25em] text-text-ondark/60 group-hover:text-accent-brass">
              {content.nav.searchLabel}
            </span>
            <kbd className="hidden xl:inline-flex items-center gap-0.5 rounded border border-hairline/80 bg-bg-primary/80 px-1.5 py-0.5 text-[8px] font-mono text-text-ondark/40 group-hover:border-accent-brass/40 group-hover:text-accent-brass/70">
              ⌘K
            </kbd>
          </button>

          {/* Account Button */}
          <button
            type="button"
            onClick={handleAccountClick}
            className={`group flex h-10 w-10 sm:w-auto sm:px-3.5 items-center justify-center gap-2 rounded-full border transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-brass ${
              isAccountActive
                ? 'border-accent-brass bg-accent-brass/10 text-accent-brass shadow-sm'
                : 'border-hairline/60 bg-bg-deep/40 text-text-ondark/80 hover:border-accent-brass/80 hover:bg-bg-deep hover:text-accent-brass'
            }`}
            aria-label={content.nav.accountLabel}
          >
            <User size={16} className="transition-transform duration-200 group-hover:scale-110" />
            <span className="hidden lg:inline uppercase text-[9.5px] tracking-[0.25em]">
              {content.nav.accountLabel}
            </span>
          </button>

          {/* Luxury Bag / Cart Button */}
          <button
            type="button"
            onClick={handleCartClick}
            className="group relative flex h-10 w-10 sm:w-auto sm:px-4 items-center justify-center gap-2.5 rounded-full border border-accent-brass/40 bg-accent-brass/10 text-accent-brass transition-all duration-300 hover:border-accent-brass hover:bg-accent-brass hover:text-bg-primary shadow-sm hover:shadow-accent-brass/20 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-brass"
            aria-label={`${content.nav.cartLabel} (${activeCartCount} items)`}
          >
            <ShoppingBag size={16} className="transition-transform duration-200 group-hover:scale-110" />
            <span className="hidden sm:inline uppercase text-[9.5px] tracking-[0.25em] font-medium">
              Bag
            </span>

            {/* Dynamic Count Badge */}
            <AnimatePresence mode="popLayout">
              {activeCartCount > 0 && (
                <motion.span
                  key={activeCartCount}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-brass text-[10px] font-bold text-bg-primary group-hover:bg-bg-primary group-hover:text-accent-brass shadow-sm"
                >
                  {activeCartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Animated Glass Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-hairline/60 bg-bg-deep/95 backdrop-blur-2xl md:hidden"
          >
            <div className="px-6 py-8 space-y-6">
              {/* Quick Search Row in Mobile Menu */}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openSearch();
                }}
                className="flex w-full items-center justify-between rounded-md border border-hairline/80 bg-bg-primary/80 px-4 py-3 text-xs uppercase tracking-[0.2em] text-text-ondark/80 hover:border-accent-brass hover:text-accent-brass transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <Search size={15} className="text-accent-brass" />
                  <span>Search Catalogue</span>
                </div>
                <span className="text-[10px] text-text-ondark/40 font-mono">⌘K</span>
              </button>

              {/* Navigation Links */}
              <nav className="flex flex-col space-y-2 divide-y divide-hairline/30">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between pt-3.5 pb-2 text-xs uppercase tracking-[0.25em] transition-colors ${
                      link.active
                        ? 'text-accent-brass font-medium pl-2 border-l-2 border-accent-brass'
                        : 'text-text-ondark/80 hover:text-accent-brass'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ArrowRight size={13} className="text-text-ondark/30" />
                  </Link>
                ))}

                {/* Account Link */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleAccountClick();
                  }}
                  className={`flex w-full items-center justify-between pt-3.5 pb-2 text-xs uppercase tracking-[0.25em] transition-colors text-left ${
                    isAccountActive
                      ? 'text-accent-brass font-medium pl-2 border-l-2 border-accent-brass'
                      : 'text-text-ondark/80 hover:text-accent-brass'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-accent-brass" />
                    <span>{content.nav.accountLabel}</span>
                  </div>
                  <ArrowRight size={13} className="text-text-ondark/30" />
                </button>
              </nav>

              {/* Atelier Heritage Footer Badge inside Mobile Menu */}
              <div className="pt-4 border-t border-hairline/60 flex items-center justify-between text-[10px] text-text-ondark/50">
                <span className="inline-flex items-center gap-1.5 text-accent-brass/90">
                  <Sparkles size={11} /> {brandConfig.name} Atelier
                </span>
                <span>{brandConfig.contact.email}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
