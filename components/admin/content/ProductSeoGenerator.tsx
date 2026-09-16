'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  RefreshCw,
  UploadCloud,
  Check,
  Copy,
  ExternalLink,
  Smartphone,
  Monitor,
  CheckCircle2,
  AlertCircle,
  Info,
  Clock,
  Code,
  Layers,
} from 'lucide-react';
import { toast } from '@/lib/store/useToast';
import { ContentProductItem, GenerationHistoryItem } from '@/lib/db/content';
import { brandConfig } from '@/config/brand.config';

interface ProductSeoGeneratorProps {
  products: ContentProductItem[];
  initialHistory: GenerationHistoryItem[];
  onHistoryUpdate?: (newHistory: GenerationHistoryItem[]) => void;
}

export function ProductSeoGenerator({
  products,
  initialHistory,
  onHistoryUpdate,
}: ProductSeoGeneratorProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ''
  );
  const activeProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // Form & Preview State
  const [metaTitle, setMetaTitle] = useState<string>(
    activeProduct?.metaTitle || `${activeProduct?.name || ''} — Handcrafted Luxury | ${brandConfig.name}`
  );
  const [metaDescription, setMetaDescription] = useState<string>(
    activeProduct?.metaDescription ||
      activeProduct?.description?.slice(0, 160) ||
      brandConfig.seo.defaultDescription
  );
  const [slug, setSlug] = useState<string>(activeProduct?.slug || '');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [showJsonLdModal, setShowJsonLdModal] = useState<boolean>(false);

  // Status State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Title & Desc Generation IDs for DB linking
  const [titleGenId, setTitleGenId] = useState<string | undefined>();
  const [descGenId, setDescGenId] = useState<string | undefined>();

  const handleProductChange = (newProductId: string) => {
    setSelectedProductId(newProductId);
    const prod = products.find((p) => p.id === newProductId);
    if (prod) {
      setMetaTitle(
        prod.metaTitle || `${prod.name} — Handcrafted Luxury | ${brandConfig.name}`
      );
      setMetaDescription(
        prod.metaDescription ||
          prod.description?.slice(0, 160) ||
          brandConfig.seo.defaultDescription
      );
      setSlug(prod.slug || '');
      setTitleGenId(undefined);
      setDescGenId(undefined);
      setErrorMessage(null);
      setPublishSuccess(false);
    }
  };

  // 1. Generate SEO Metadata with Gemini
  const handleGenerateSeo = async () => {
    if (!activeProduct) return;
    setIsGenerating(true);
    setErrorMessage(null);
    setPublishSuccess(false);

    try {
      const res = await fetch('/api/admin/seo/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: activeProduct.id,
          name: activeProduct.name,
          categoryName: activeProduct.category,
          basePrice: activeProduct.basePrice,
          description: activeProduct.description,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate SEO metadata');
      }

      setMetaTitle(data.seo.metaTitle);
      setMetaDescription(data.seo.metaDescription);
      if (data.seo.slug) {
        setSlug(data.seo.slug);
      }
      setTitleGenId(data.titleGenId);
      setDescGenId(data.descGenId);

      toast.success('AI SEO metadata generated', {
        title: 'SEO Ready',
      });

      // Refresh history list if parent provided handler
      if (onHistoryUpdate) {
        fetchHistory(activeProduct.id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred generating SEO metadata.');
      toast.error(err.message || 'Failed to generate SEO metadata');
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Publish SEO to PostgreSQL & Storefront
  const handlePublishSeo = async () => {
    if (!activeProduct) return;
    setIsPublishing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/seo/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: activeProduct.id,
          metaTitle,
          metaDescription,
          slug,
          titleGenId,
          descGenId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish SEO metadata');
      }

      activeProduct.metaTitle = metaTitle;
      activeProduct.metaDescription = metaDescription;
      setPublishSuccess(true);
      setTimeout(() => setPublishSuccess(false), 4000);

      toast.success(`Published SEO metadata to "${activeProduct.name}"`, {
        title: 'Storefront SEO Updated',
      });

      if (onHistoryUpdate) {
        fetchHistory(activeProduct.id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to publish SEO metadata.');
      toast.error(err.message || 'Failed to publish SEO metadata');
    } finally {
      setIsPublishing(false);
    }
  };

  const fetchHistory = async (prodId: string) => {
    try {
      const res = await fetch(`/api/admin/content/history?productId=${prodId}`);
      const data = await res.json();
      if (data.success && onHistoryUpdate) {
        onHistoryUpdate(data.history);
      }
    } catch (e) {
      console.warn('Could not refresh history:', e);
    }
  };

  const titleLength = metaTitle.length;
  const descLength = metaDescription.length;

  const getTitleStatus = (len: number) => {
    if (len >= 50 && len <= 60) return { color: 'text-emerald-400', label: 'Optimal (50-60ch)' };
    if (len >= 40 && len <= 70) return { color: 'text-amber-400', label: 'Acceptable' };
    return { color: 'text-red-400', label: 'Too short / long' };
  };

  const getDescStatus = (len: number) => {
    if (len >= 150 && len <= 160) return { color: 'text-emerald-400', label: 'Optimal (150-160ch)' };
    if (len >= 130 && len <= 175) return { color: 'text-amber-400', label: 'Acceptable' };
    return { color: 'text-red-400', label: 'Too short / long' };
  };

  const titleStatus = getTitleStatus(titleLength);
  const descStatus = getDescStatus(descLength);

  // Generate Sample JSON-LD for Preview
  const sampleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: activeProduct?.name,
    image: [activeProduct?.image],
    description: metaDescription,
    sku: activeProduct?.slug,
    brand: {
      '@type': 'Brand',
      name: brandConfig.name,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: brandConfig.currency.code,
      price: activeProduct?.basePrice,
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <div className="space-y-6">
      {/* 1. Selection & Header Toolbar */}
      <div className="border border-hairline bg-bg-deep p-4 sm:p-6 rounded-md shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-2">
            <label className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium flex items-center gap-2">
              <Layers size={14} /> Target Product for SEO Optimization
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full appearance-none bg-bg-primary border border-hairline px-4 py-3 text-sm text-text-ondark focus:border-accent-brass focus:outline-none transition-colors"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id} className="bg-bg-primary text-text-ondark">
                  {p.name} ({p.category}) {p.metaTitle ? '✓ SEO Set' : '— Needs SEO'}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-4 flex items-end justify-start lg:justify-end gap-2 pt-2 lg:pt-0">
            <button
              type="button"
              onClick={handleGenerateSeo}
              disabled={isGenerating || isPublishing}
              className="w-full lg:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-bg-primary hover:bg-bg-deep border border-accent-brass/60 text-accent-brass text-xs uppercase tracking-[0.2em] font-medium transition-all hover:border-accent-brass disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw size={14} className="animate-spin" /> Generating SEO...
                </>
              ) : (
                <>
                  <Sparkles size={14} /> AI Generate SEO
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Google SERP Simulator & Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Real-time Google SERP Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-hairline bg-bg-deep p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <div className="flex items-center gap-2">
                <Search size={15} className="text-accent-brass" />
                <span className="text-xs font-serif text-text-ondark tracking-wide">
                  Google SERP Snippet Preview
                </span>
              </div>
              {/* Desktop vs Mobile Toggle */}
              <div className="flex items-center border border-hairline p-0.5 bg-bg-primary">
                <button
                  type="button"
                  onClick={() => setViewMode('desktop')}
                  className={`p-1.5 transition-colors ${
                    viewMode === 'desktop'
                      ? 'bg-accent-brass/20 text-accent-brass'
                      : 'text-text-ondark/50 hover:text-text-ondark'
                  }`}
                  title="Desktop Preview"
                >
                  <Monitor size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('mobile')}
                  className={`p-1.5 transition-colors ${
                    viewMode === 'mobile'
                      ? 'bg-accent-brass/20 text-accent-brass'
                      : 'text-text-ondark/50 hover:text-text-ondark'
                  }`}
                  title="Mobile Preview"
                >
                  <Smartphone size={14} />
                </button>
              </div>
            </div>

            {/* Google Search Result Card Mockup */}
            <div
              className={`border border-hairline/60 bg-[#202124] p-4 text-left transition-all ${
                viewMode === 'mobile' ? 'max-w-[340px] mx-auto rounded-lg' : 'rounded-sm'
              }`}
            >
              {/* Site URL & Breadcrumb */}
              <div className="flex items-center gap-2 mb-1 text-[11px] text-[#bdc1c6]">
                <div className="h-4 w-4 rounded-full bg-accent-brass/30 flex items-center justify-center text-[9px] text-accent-brass font-bold">
                  M
                </div>
                <div className="truncate">
                  <span className="text-[#dadce0] font-normal">{brandConfig.name}</span>
                  <span className="text-[#9aa0a6] mx-1">›</span>
                  <span className="text-[#9aa0a6]">product › {slug || activeProduct?.slug}</span>
                </div>
              </div>

              {/* Title (Clickable blue in Google) */}
              <h4 className="text-[#8ab4f8] hover:underline text-sm md:text-base font-normal leading-snug cursor-pointer line-clamp-2">
                {metaTitle || `${activeProduct?.name} — ${brandConfig.name}`}
              </h4>

              {/* Description snippet */}
              <p className="text-[#bdc1c6] text-xs font-light leading-relaxed mt-1 line-clamp-2">
                {metaDescription ||
                  activeProduct?.description ||
                  brandConfig.seo.defaultDescription}
              </p>

              {/* Rich snippet badges */}
              <div className="mt-2.5 pt-2 border-t border-[#3c4043] flex items-center gap-3 text-[10px] text-[#9aa0a6]">
                <span>★★★★★ 4.9 (19)</span>
                <span>·</span>
                <span>
                  {brandConfig.currency.symbol}
                  {activeProduct?.basePrice?.toLocaleString()}
                </span>
                <span>·</span>
                <span className="text-emerald-400">In stock</span>
              </div>
            </div>

            {/* Quick Actions for JSON-LD */}
            <div className="pt-2 flex items-center justify-between text-xs text-text-ondark/60">
              <button
                type="button"
                onClick={() => setShowJsonLdModal(true)}
                className="hover:text-accent-brass flex items-center gap-1.5 transition-colors"
              >
                <Code size={13} className="text-accent-brass" /> Inspect JSON-LD Schema
              </button>
              <Link
                href={`/product/${activeProduct?.slug}`}
                target="_blank"
                className="hover:text-accent-brass flex items-center gap-1 transition-colors"
              >
                View Live PDP <ExternalLink size={12} />
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Meta Tag Editor & Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border border-hairline bg-bg-deep p-6 space-y-5">
            {/* Feedback Banners */}
            {errorMessage && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {publishSuccess && (
              <div className="p-3 bg-emerald-900/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  <span>
                    Published SEO metadata to PostgreSQL & revalidated PDP & sitemap!
                  </span>
                </div>
                <Link
                  href={`/product/${activeProduct?.slug}`}
                  target="_blank"
                  className="underline underline-offset-2 text-emerald-200 hover:text-white"
                >
                  Verify Page Source →
                </Link>
              </div>
            )}

            {/* 1. Meta Title */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="text-[10px] uppercase tracking-[0.2em] text-text-ondark/70 font-medium">
                  Meta Title Tag
                </label>
                <span className={`text-[11px] font-medium ${titleStatus.color}`}>
                  {titleLength}/60 chars ({titleStatus.label})
                </span>
              </div>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Product Name — Key Attribute | Brand Name"
                className="w-full bg-bg-primary border border-hairline px-4 py-2.5 text-xs text-text-ondark focus:border-accent-brass focus:outline-none transition-colors"
              />
            </div>

            {/* 2. Meta Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="text-[10px] uppercase tracking-[0.2em] text-text-ondark/70 font-medium">
                  Meta Description
                </label>
                <span className={`text-[11px] font-medium ${descStatus.color}`}>
                  {descLength}/160 chars ({descStatus.label})
                </span>
              </div>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={4}
                placeholder="A compelling 150-160 character description highlighting craftsmanship and silhouette..."
                className="w-full bg-bg-primary border border-hairline p-4 text-xs font-light text-text-ondark leading-relaxed focus:border-accent-brass focus:outline-none transition-colors resize-y"
              />
            </div>

            {/* 3. URL Slug */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-[0.2em] text-text-ondark/70 font-medium">
                URL Slug Suggestion
              </label>
              <div className="flex items-center bg-bg-primary border border-hairline px-3 py-2 text-xs text-text-ondark/60">
                <span className="text-text-ondark/40">/product/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-transparent text-text-ondark focus:outline-none ml-0.5"
                />
              </div>
            </div>

            {/* Submit Toolbar */}
            <div className="pt-2 flex items-center justify-between gap-4 border-t border-hairline">
              <button
                type="button"
                onClick={handleGenerateSeo}
                disabled={isGenerating || isPublishing}
                className="flex items-center gap-2 text-xs text-accent-brass hover:underline disabled:opacity-50"
              >
                <RefreshCw size={13} className={isGenerating ? 'animate-spin' : ''} /> Regenerate
                with Gemini
              </button>

              <button
                type="button"
                onClick={handlePublishSeo}
                disabled={isPublishing || isGenerating}
                className={`flex items-center gap-2 px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-medium transition-all ${
                  publishSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-accent-brass text-bg-primary hover:bg-accent-brass-hover disabled:opacity-40'
                }`}
              >
                {isPublishing ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Publishing SEO...
                  </>
                ) : publishSuccess ? (
                  <>
                    <Check size={14} /> SEO Published!
                  </>
                ) : (
                  <>
                    <UploadCloud size={14} /> Publish SEO
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* JSON-LD Schema Modal */}
      {showJsonLdModal && (
        <div className="fixed inset-0 z-50 bg-bg-deep/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-bg-deep border border-hairline max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h3 className="font-serif text-lg text-text-ondark">
                Schema.org JSON-LD Product Markup
              </h3>
              <button
                onClick={() => setShowJsonLdModal(false)}
                className="text-text-ondark/60 hover:text-text-ondark text-xs uppercase tracking-wider"
              >
                Close
              </button>
            </div>

            <pre className="bg-bg-primary p-4 text-[11px] font-mono text-text-ondark/80 overflow-x-auto max-h-96 border border-hairline">
              {JSON.stringify(sampleJsonLd, null, 2)}
            </pre>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(sampleJsonLd, null, 2));
                  setCopiedSuccess(true);
                  setTimeout(() => setCopiedSuccess(false), 2000);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-accent-brass text-bg-primary text-xs uppercase tracking-wider font-medium"
              >
                {copiedSuccess ? <Check size={13} /> : <Copy size={13} />}
                {copiedSuccess ? 'Copied' : 'Copy JSON-LD'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
