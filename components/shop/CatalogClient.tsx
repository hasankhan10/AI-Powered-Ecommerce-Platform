'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import { FilterSidebar } from './FilterSidebar';
import { SortDropdown } from './SortDropdown';
import { ProductCard } from '@/components/product/ProductCard';
import { FormattedProduct } from '@/lib/db/homepage';
import { FilterOptions } from '@/lib/db/catalog';
import { content } from '@/config/content';

interface CatalogClientProps {
  initialProducts: FormattedProduct[];
  filterOptions: FilterOptions;
  currentCategorySlug?: string;
  categoryTitle?: string;
}

export function CatalogClient({
  initialProducts,
  filterOptions,
  currentCategorySlug = 'all',
  categoryTitle,
}: CatalogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedCategory, setSelectedCategory] = useState<string>(
    currentCategorySlug || searchParams.get('category') || 'all'
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    searchParams.get('size') || undefined
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    searchParams.get('color') || undefined
  );
  const [selectedPriceMax, setSelectedPriceMax] = useState<number | undefined>(
    searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
  );
  const [sortOrder, setSortOrder] = useState<'newest' | 'price_asc' | 'price_desc'>('newest');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (selectedSize) count++;
    if (selectedColor) count++;
    if (selectedPriceMax !== undefined && selectedPriceMax < filterOptions.maxPrice) count++;
    return count;
  }, [selectedCategory, selectedSize, selectedColor, selectedPriceMax, filterOptions.maxPrice]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedSize(undefined);
    setSelectedColor(undefined);
    setSelectedPriceMax(undefined);
  };

  // Filter & sort products locally for instant response
  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];

    if (selectedCategory !== 'all') {
      result = result.filter(
        (p) => p.categorySlug.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (selectedPriceMax !== undefined) {
      result = result.filter((p) => p.minPrice <= selectedPriceMax);
    }

    if (sortOrder === 'price_asc') {
      result.sort((a, b) => a.minPrice - b.minPrice);
    } else if (sortOrder === 'price_desc') {
      result.sort((a, b) => b.minPrice - a.minPrice);
    }

    return result;
  }, [initialProducts, selectedCategory, selectedPriceMax, sortOrder]);

  const aspectRatios: ('portrait' | 'tall' | 'square')[] = [
    'portrait',
    'tall',
    'square',
    'tall',
    'portrait',
    'square',
  ];

  return (
    <div className="w-full bg-bg-primary min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Catalog Header */}
        <div className="border-b border-hairline pb-8 mb-12 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div>
            <span className="text-[11px] uppercase tracking-[0.3em] text-accent-brass font-medium">
              Catalogue
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-light text-text-ondark tracking-tight mt-1">
              {categoryTitle || content.shop.headline}
            </h1>
            <p className="text-xs text-text-ondark/60 font-light mt-2">
              Showing {filteredProducts.length} considered piece{filteredProducts.length === 1 ? '' : 's'}
            </p>
          </div>

          {/* Action Bar (Mobile Filter Toggle + Sort) */}
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 border border-hairline bg-bg-deep px-4 py-2 text-xs uppercase tracking-wider text-text-ondark hover:border-accent-brass transition-colors lg:hidden"
            >
              <SlidersHorizontal size={14} className="text-accent-brass" />
              <span>{content.shop.filterLabel}</span>
              {activeFilterCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center bg-accent-brass text-[9px] font-bold text-bg-primary">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <SortDropdown value={sortOrder} onChange={setSortOrder} />
          </div>
        </div>

        {/* Active Filter Badges */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8">
            <span className="text-[10px] uppercase tracking-wider text-text-ondark/40 mr-2">
              Active:
            </span>

            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="inline-flex items-center gap-1.5 border border-accent-brass/40 bg-accent-brass/10 px-3 py-1 text-xs text-accent-brass"
              >
                <span>Category: {selectedCategory}</span>
                <X size={12} />
              </button>
            )}

            {selectedSize && (
              <button
                onClick={() => setSelectedSize(undefined)}
                className="inline-flex items-center gap-1.5 border border-accent-brass/40 bg-accent-brass/10 px-3 py-1 text-xs text-accent-brass"
              >
                <span>Size: {selectedSize}</span>
                <X size={12} />
              </button>
            )}

            {selectedColor && (
              <button
                onClick={() => setSelectedColor(undefined)}
                className="inline-flex items-center gap-1.5 border border-accent-brass/40 bg-accent-brass/10 px-3 py-1 text-xs text-accent-brass"
              >
                <span>Color: {selectedColor}</span>
                <X size={12} />
              </button>
            )}

            {selectedPriceMax !== undefined && selectedPriceMax < filterOptions.maxPrice && (
              <button
                onClick={() => setSelectedPriceMax(undefined)}
                className="inline-flex items-center gap-1.5 border border-accent-brass/40 bg-accent-brass/10 px-3 py-1 text-xs text-accent-brass"
              >
                <span>Under ₹{selectedPriceMax.toLocaleString('en-IN')}</span>
                <X size={12} />
              </button>
            )}

            <button
              onClick={handleResetFilters}
              className="text-xs text-text-ondark/50 hover:text-accent-brass underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Catalog Body: Sidebar + Grid */}
        <div className="flex items-start">
          <FilterSidebar
            filterOptions={filterOptions}
            selectedCategory={selectedCategory}
            selectedSize={selectedSize}
            selectedColor={selectedColor}
            selectedPriceMax={selectedPriceMax}
            onSelectCategory={setSelectedCategory}
            onSelectSize={setSelectedSize}
            onSelectColor={setSelectedColor}
            onSelectPriceMax={setSelectedPriceMax}
            onResetFilters={handleResetFilters}
            activeFilterCount={activeFilterCount}
            isMobileOpen={mobileFiltersOpen}
            onCloseMobile={() => setMobileFiltersOpen(false)}
          />

          {/* Product Grid */}
          <div className="flex-1 w-full">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 lg:gap-8">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="w-full">
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      slug={product.slug}
                      categoryName={product.categoryName}
                      price={product.minPrice}
                      marketPrice={product.marketPrice}
                      imageUrl={product.imageUrl}
                      aspectRatio="portrait"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-hairline bg-bg-deep/60 p-16 text-center space-y-4">
                <h3 className="font-serif text-2xl text-text-ondark font-light">
                  {content.shop.noResults}
                </h3>
                <p className="text-xs text-text-ondark/60 font-light max-w-sm mx-auto">
                  Try adjusting or clearing your filters to view more handcrafted items from our collection.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-accent-brass px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-medium text-bg-primary hover:bg-accent-brass-hover transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
