'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ShoppingBag, Sparkles, Check } from 'lucide-react';
import { DetailedProduct, ProductVariantItem } from '@/lib/db/catalog';
import { brandConfig } from '@/config/brand.config';
import { content } from '@/config/content';
import { useCartStore } from '@/lib/store/useCartStore';
import { useAssistantStore } from '@/lib/store/useAssistantStore';
import { ProductPurchaseToast } from './ProductSocialProof';
import { parseProductMetadata } from '@/lib/utils/productMetadata';
import { ProductGallery } from './ProductGallery';
import { ProductVariantSelector } from './ProductVariantSelector';
import { ProductAccordionInfo } from './ProductAccordionInfo';

interface ProductDetailClientProps {
  product: DetailedProduct;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem } = useCartStore();
  const { openAssistant } = useAssistantStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const sizes = useMemo(() => {
    return Array.from(
      new Set(product.variants.map((v) => v.size).filter(Boolean))
    ) as string[];
  }, [product.variants]);

  const colors = useMemo(() => {
    return Array.from(
      new Set(product.variants.map((v) => v.color).filter(Boolean))
    ) as string[];
  }, [product.variants]);

  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizes.length > 0 ? sizes[0] : null
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(
    colors.length > 0 ? colors[0] : null
  );

  const currentVariant: ProductVariantItem | undefined = useMemo(() => {
    if (product.variants.length === 0) return undefined;

    return (
      product.variants.find((v) => {
        const sizeMatch = sizes.length === 0 || v.size === selectedSize;
        const colorMatch = colors.length === 0 || v.color === selectedColor;
        return sizeMatch && colorMatch;
      }) || product.variants[0]
    );
  }, [product.variants, selectedSize, selectedColor, sizes.length, colors.length]);

  const currentPrice = currentVariant ? currentVariant.price : product.basePrice;
  const currentStock = currentVariant ? currentVariant.stock : 0;
  const isOutOfStock = currentStock <= 0;

  const [quantity, setQuantity] = useState(1);
  const [addingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const productMeta = useMemo(() => parseProductMetadata(product.description), [product.description]);
  const isSocialProofEnabled = productMeta.isSocialProofEnabled;
  const cleanedDescription = productMeta.cleanDescription;
  const marketPrice = product.marketPrice ?? productMeta.marketPrice;

  const hasDiscount = !!marketPrice && marketPrice > currentPrice;
  const discountPercent = hasDiscount ? Math.round(((marketPrice - currentPrice) / marketPrice) * 100) : null;

  const formattedPrice = new Intl.NumberFormat(brandConfig.currency.locale, {
    style: 'currency',
    currency: brandConfig.currency.code,
    maximumFractionDigits: 0,
  }).format(currentPrice);

  const formattedMarketPrice =
    hasDiscount && marketPrice
      ? new Intl.NumberFormat(brandConfig.currency.locale, {
          style: 'currency',
          currency: brandConfig.currency.code,
          maximumFractionDigits: 0,
        }).format(marketPrice)
      : null;

  const activeImage = product.images[activeImageIndex] || {
    url: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200&q=80',
    altText: product.name,
  };

  const handleAddToCart = () => {
    if (!currentVariant || isOutOfStock) return;

    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2500);

    addItem(product.id, currentVariant.id, quantity, {
      productName: product.name,
      productSlug: product.slug,
      price: currentPrice,
      imageUrl: activeImage.url,
      size: currentVariant.size,
      color: currentVariant.color,
      stock: currentVariant.stock,
    });
  };

  return (
    <div className="w-full bg-bg-primary py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs text-text-ondark/50 mb-10">
          <Link href="/" className="hover:text-accent-brass transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-accent-brass transition-colors">
            {content.nav.shopLabel}
          </Link>
          <span>/</span>
          <Link
            href={`/shop/${product.category.slug}`}
            className="hover:text-accent-brass transition-colors"
          >
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-text-ondark/90 truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left: Gallery Column */}
          <ProductGallery
            images={product.images}
            productName={product.name}
            activeImageIndex={activeImageIndex}
            onSelectImage={setActiveImageIndex}
          />

          {/* Right: Info & Actions Column */}
          <div className="lg:col-span-5 space-y-8">
            {/* Title & Price Header */}
            <div className="space-y-2 border-b border-hairline pb-6">
              <span className="text-[10px] uppercase tracking-[0.3em] text-accent-brass font-medium">
                {product.category.name}
              </span>
              <h1 className="font-serif text-3xl md:text-4xl font-light text-text-ondark tracking-tight">
                {product.name}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pt-2">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-serif text-text-ondark font-light">
                    {formattedPrice}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="line-through text-text-ondark/40 text-base sm:text-lg font-light font-sans">
                        {formattedMarketPrice}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-accent-brass/15 text-accent-brass border border-accent-brass/40 rounded">
                        {discountPercent}% OFF
                      </span>
                    </>
                  )}
                </div>
                <span className="text-[11px] uppercase tracking-widest text-text-ondark/50">
                  Tax included
                </span>
              </div>
            </div>

            {/* AI Stylist Recommendation Hook */}
            <div
              onClick={() =>
                openAssistant({
                  initialPrompt: `How would you style the ${product.name}, and what pieces pair best with it?`,
                  productContext: {
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: product.basePrice,
                  },
                })
              }
              className="border border-accent-brass/30 bg-accent-brass/5 hover:bg-accent-brass/10 hover:border-accent-brass/60 p-4 flex items-start gap-3 cursor-pointer transition-colors group rounded-md"
            >
              <Sparkles
                size={18}
                className="text-accent-brass shrink-0 mt-0.5 group-hover:scale-110 transition-transform"
              />
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-medium text-accent-brass uppercase tracking-wider">
                    {content.product.askStylist}
                  </h4>
                  <span className="text-[10px] text-accent-brass/80 group-hover:text-accent-brass font-light underline-offset-4 group-hover:underline">
                    Ask Assistant →
                  </span>
                </div>
                <p className="text-xs text-text-ondark/70 font-light leading-relaxed">
                  Wondering how to style the {product.name} or looking for complementary pieces? Ask our AI personal assistant.
                </p>
              </div>
            </div>

            {/* Variant Selectors */}
            <ProductVariantSelector
              colors={colors}
              sizes={sizes}
              variants={product.variants}
              selectedColor={selectedColor}
              selectedSize={selectedSize}
              currentStock={currentStock}
              isOutOfStock={isOutOfStock}
              isSocialProofEnabled={isSocialProofEnabled}
              onSelectColor={setSelectedColor}
              onSelectSize={setSelectedSize}
            />

            {/* Quantity & Add to Cart Actions */}
            <div className="space-y-4 pt-4 border-t border-hairline">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-hairline bg-bg-deep rounded-md overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="px-3 py-3 text-text-ondark/60 hover:text-accent-brass disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-mono text-text-ondark">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    disabled={quantity >= currentStock || isOutOfStock}
                    className="px-3 py-3 text-text-ondark/60 hover:text-accent-brass disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || addingToCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 text-xs uppercase tracking-[0.25em] font-medium transition-all rounded-md shadow-md cursor-pointer ${
                    addedSuccess
                      ? 'bg-emerald-600 text-text-ondark'
                      : isOutOfStock
                      ? 'bg-bg-deep text-text-ondark/40 border border-hairline cursor-not-allowed'
                      : 'bg-accent-brass text-bg-primary hover:bg-accent-brass-hover'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check size={16} /> Added to Cart
                    </>
                  ) : addingToCart ? (
                    'Adding to Bag...'
                  ) : isOutOfStock ? (
                    content.shop.outOfStock
                  ) : (
                    <>
                      <ShoppingBag size={16} /> {content.shop.addToCart}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Accordion Information & Value Props */}
            <ProductAccordionInfo description={cleanedDescription} />
          </div>
        </div>
      </div>

      {/* Social Proof Buying Simulation Popup Toast */}
      <ProductPurchaseToast
        productName={product.name}
        productImage={activeImage.url}
        enabled={isSocialProofEnabled}
      />
    </div>
  );
}
