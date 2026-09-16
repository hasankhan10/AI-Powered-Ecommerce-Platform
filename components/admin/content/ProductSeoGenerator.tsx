'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  RefreshCw,
  UploadCloud,
  Check,
  CheckCircle2,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { toast } from '@/lib/store/useToast';
import { ContentProductItem, GenerationHistoryItem } from '@/lib/db/content';
import { brandConfig } from '@/config/brand.config';
import { GoogleSerpSimulator } from './GoogleSerpSimulator';
import { JsonLdModal } from './JsonLdModal';

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
  const [showJsonLdModal, setShowJsonLdModal] = useState<boolean>(false);

  // Status State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generation IDs for DB linking
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
      if (!res.ok) throw new Error(data.error || 'Failed to generate SEO metadata');

      setMetaTitle(data.seo.metaTitle);
      setMetaDescription(data.seo.metaDescription);
      if (data.seo.slug) setSlug(data.seo.slug);
      setTitleGenId(data.titleGenId);
      setDescGenId(data.descGenId);

      toast.success('AI SEO metadata generated', 'SEO Ready');

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
      if (!res.ok) throw new Error(data.error || 'Failed to publish SEO metadata');

      activeProduct.metaTitle = metaTitle;
      activeProduct.metaDescription = metaDescription;
      setPublishSuccess(true);
      setTimeout(() => setPublishSuccess(false), 4000);

      toast.success(`Published SEO metadata to "${activeProduct.name}"`, 'Storefront SEO Updated');

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
              className="w-full appearance-none bg-bg-primary border border-hairline px-4 py-3 text-sm text-text-ondark focus:border-accent-brass focus:outline-none transition-colors cursor-pointer"
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
              className="w-full lg:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-bg-primary hover:bg-bg-deep border border-accent-brass/60 text-accent-brass text-xs uppercase tracking-[0.2em] font-medium transition-all hover:border-accent-brass disabled:opacity-50 cursor-pointer"
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
        {/* Left: Google SERP Simulator (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <GoogleSerpSimulator
            product={activeProduct}
            metaTitle={metaTitle}
            metaDescription={metaDescription}
            slug={slug}
            onOpenJsonLd={() => setShowJsonLdModal(true)}
          />
        </div>

        {/* Right: Meta Tag Editor & Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border border-hairline bg-bg-deep p-6 space-y-5">
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
                className="flex items-center gap-2 text-xs text-accent-brass hover:underline disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={13} className={isGenerating ? 'animate-spin' : ''} /> Regenerate with Gemini
              </button>

              <button
                type="button"
                onClick={handlePublishSeo}
                disabled={isPublishing || isGenerating}
                className={`flex items-center gap-2 px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-medium transition-all cursor-pointer ${
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
      <JsonLdModal
        isOpen={showJsonLdModal}
        jsonData={sampleJsonLd}
        onClose={() => setShowJsonLdModal(false)}
      />
    </div>
  );
}
