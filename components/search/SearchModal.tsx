'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
  Sparkles,
  ArrowRight,
  Package,
  Layers,
  CornerDownLeft,
  Filter,
} from 'lucide-react';
import { useSearchStore, SearchProductResult } from '@/lib/store/useSearchStore';

const SUGGESTED_QUERIES = [
  'Linen shirts under ₹5000',
  'Silk accessories',
  'Dinner party outfits under ₹8000',
  'Handcrafted ceramics',
];

export function SearchModal() {
  const router = useRouter();
  const {
    isOpen,
    query,
    results,
    isLoading,
    openSearch,
    closeSearch,
    setQuery,
    setResults,
    setIsLoading,
  } = useSearchStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Global Keyboard Listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          closeSearch();
        } else {
          openSearch();
        }
      } else if (e.key === 'Escape' && isOpen) {
        closeSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, openSearch, closeSearch]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(-1);
    }
  }, [isOpen]);

  // Debounced search query
  const performSearch = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setResults({ query: '', products: [], categories: [] });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setSelectedIndex(-1);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [setResults, setIsLoading]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Keyboard navigation through results
  const allItems = [
    ...results.categories.map((c) => ({ type: 'category' as const, data: c })),
    ...results.products.map((p) => ({ type: 'product' as const, data: p })),
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (allItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < allItems.length) {
        const item = allItems[selectedIndex];
        if (item.type === 'category') {
          handleCategoryClick(item.data.slug);
        } else {
          handleProductClick(item.data.slug);
        }
      } else if (results.products.length > 0) {
        handleProductClick(results.products[0].slug);
      }
    }
  };

  const handleProductClick = (slug: string) => {
    closeSearch();
    router.push(`/product/${slug}`);
  };

  const handleCategoryClick = (slug: string) => {
    closeSearch();
    router.push(`/shop/${slug}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={closeSearch}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-2xl bg-bg-deep border border-hairline shadow-2xl overflow-hidden rounded-xl animate-in zoom-in-95 duration-200">
        {/* Search Header */}
        <div className="flex items-center gap-3 border-b border-hairline px-4 py-3.5 bg-bg-primary/50">
          <Search size={18} className="text-accent-brass shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by keyword, material, or intent (e.g. 'linen shirts under 5000')..."
            className="flex-1 bg-transparent text-sm text-text-ondark placeholder:text-text-ondark/35 focus:outline-none font-light"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-text-ondark/40 hover:text-text-ondark transition-colors rounded-md"
            >
              <X size={16} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-text-ondark/40 border border-hairline bg-bg-deep rounded-md">
            ESC
          </kbd>
        </div>

        {/* Parsed Constraint Indicator */}
        {results.parsedConstraints && (results.parsedConstraints.maxPrice || results.parsedConstraints.category) && (
          <div className="px-4 py-2 bg-accent-brass/5 border-b border-accent-brass/20 flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-[11px] text-accent-brass font-medium">
              <Filter size={12} />
              AI Filters:
            </span>
            {results.parsedConstraints.maxPrice && (
              <span className="px-2 py-0.5 text-[10px] border border-accent-brass/30 bg-accent-brass/10 text-accent-brass rounded-md">
                Under ₹{results.parsedConstraints.maxPrice.toLocaleString('en-IN')}
              </span>
            )}
            {results.parsedConstraints.category && (
              <span className="px-2 py-0.5 text-[10px] border border-hairline text-text-ondark/80 rounded-md">
                Category: {results.parsedConstraints.category}
              </span>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
          {/* Initial State: Suggested Queries */}
          {!query.trim() && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-accent-brass font-medium">
                <Sparkles size={14} />
                Suggested Inquiries
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTED_QUERIES.map((sq) => (
                  <button
                    key={sq}
                    type="button"
                    onClick={() => {
                      setQuery(sq);
                      performSearch(sq);
                    }}
                    className="p-3 text-left text-xs text-text-ondark/70 hover:text-text-ondark bg-bg-primary/40 hover:bg-bg-primary/80 border border-hairline hover:border-accent-brass/40 transition-colors flex items-center justify-between group rounded-md"
                  >
                    <span>{sq}</span>
                    <ArrowRight
                      size={13}
                      className="text-accent-brass opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && query.trim() && (
            <div className="py-12 text-center text-xs text-accent-brass flex items-center justify-center gap-2 font-light">
              <Sparkles size={14} className="animate-spin" />
              <span>Searching collection with semantic AI...</span>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && query.trim() && (
            <>
              {/* Category Matches */}
              {results.categories.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium flex items-center gap-1.5">
                    <Layers size={12} />
                    Categories ({results.categories.length})
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {results.categories.map((cat, idx) => {
                      const isSelected = selectedIndex === idx;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleCategoryClick(cat.slug)}
                          className={`px-3 py-1.5 text-xs transition-colors flex items-center gap-2 border rounded-md ${
                            isSelected
                              ? 'border-accent-brass bg-accent-brass/20 text-accent-brass'
                              : 'border-hairline bg-bg-primary/40 text-text-ondark hover:border-accent-brass/50'
                          }`}
                        >
                          <span>{cat.name}</span>
                          <span className="text-[10px] text-text-ondark/40">
                            ({cat.productCount})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Product Matches */}
              {results.products.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium flex items-center gap-1.5">
                    <Package size={12} />
                    Pieces ({results.products.length})
                  </span>
                  <div className="divide-y divide-hairline border border-hairline rounded-md overflow-hidden">
                    {results.products.map((prod, idx) => {
                      const itemIndex = results.categories.length + idx;
                      const isSelected = selectedIndex === itemIndex;

                      return (
                        <div
                          key={prod.id}
                          onClick={() => handleProductClick(prod.slug)}
                          className={`p-3 flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-accent-brass/10 border-l-2 border-l-accent-brass'
                              : 'hover:bg-bg-primary/50'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative w-12 h-14 bg-bg-primary overflow-hidden border border-hairline shrink-0 rounded-md">
                              {prod.image ? (
                                <Image
                                  src={prod.image}
                                  alt={prod.name}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[10px] text-text-ondark/30">
                                  Maison
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 space-y-0.5">
                              <span className="text-[9px] uppercase tracking-wider text-accent-brass/80 block">
                                {prod.category}
                              </span>
                              <p className="text-xs font-serif font-light text-text-ondark truncate">
                                {prod.name}
                              </p>
                              <div className="flex items-center gap-2 text-[11px]">
                                <span className="font-serif text-text-ondark">
                                  ₹{prod.basePrice.toLocaleString('en-IN')}
                                </span>
                                {prod.inStock ? (
                                  <span className="text-[9px] text-emerald-400">● In Stock</span>
                                ) : (
                                  <span className="text-[9px] text-rose-400">● Sold Out</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-accent-brass font-light hover:underline hidden sm:inline">
                              View Piece
                            </span>
                            <ArrowRight size={14} className="text-accent-brass" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                results.categories.length === 0 && (
                  <div className="py-12 text-center space-y-2">
                    <Package size={28} className="text-accent-brass/40 mx-auto" />
                    <p className="text-xs text-text-ondark/60 font-light">
                      No pieces found matching &ldquo;{query}&rdquo;.
                    </p>
                    <p className="text-[11px] text-text-ondark/40">
                      Try searching by fabric (e.g. linen, silk), category, or natural price range.
                    </p>
                  </div>
                )
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-hairline px-4 py-2.5 bg-bg-primary/50 flex items-center justify-between text-[10px] text-text-ondark/40 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 border border-hairline bg-bg-deep rounded-sm">↑↓</kbd> to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 border border-hairline bg-bg-deep rounded-sm">↵</kbd> to select
            </span>
          </div>
          <span>Semantic Hybrid Search</span>
        </div>
      </div>
    </div>
  );
}
