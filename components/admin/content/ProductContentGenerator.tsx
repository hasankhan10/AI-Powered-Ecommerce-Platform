'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  RefreshCw,
  UploadCloud,
  Check,
  Copy,
  ExternalLink,
  Sliders,
  FileText,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  History,
  Info,
} from 'lucide-react';
import { toast } from '@/lib/store/useToast';
import { ContentProductItem, GenerationHistoryItem } from '@/lib/db/content';
import { CopyTone, TONE_DEFINITIONS } from '@/lib/ai/copywriter';
import { brandConfig } from '@/config/brand.config';

interface ProductContentGeneratorProps {
  products: ContentProductItem[];
  initialHistory: GenerationHistoryItem[];
  onHistoryUpdate?: (newHistory: GenerationHistoryItem[]) => void;
}

export function ProductContentGenerator({
  products,
  initialHistory,
  onHistoryUpdate,
}: ProductContentGeneratorProps) {
  // 1. Selection State
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ''
  );
  const [selectedTone, setSelectedTone] = useState<CopyTone>('editorial');

  // Active product details
  const activeProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // 2. Editor & Generation State
  const [currentDescription, setCurrentDescription] = useState<string>(
    activeProduct?.description || ''
  );
  const [generatedText, setGeneratedText] = useState<string>('');
  const [activeGenerationId, setActiveGenerationId] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishSuccess, setPublishSuccess] = useState<boolean>(false);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync current description when selected product changes
  const handleProductChange = (newProductId: string) => {
    setSelectedProductId(newProductId);
    const prod = products.find((p) => p.id === newProductId);
    if (prod) {
      setCurrentDescription(prod.description || '');
      setGeneratedText('');
      setActiveGenerationId(null);
      setErrorMessage(null);
      setPublishSuccess(false);
    }
  };

  // 3. Trigger AI Generation / Regeneration
  const handleGenerate = async () => {
    if (!activeProduct) return;
    setIsGenerating(true);
    setErrorMessage(null);
    setPublishSuccess(false);

    try {
      const res = await fetch('/api/admin/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: activeProduct.id,
          tone: selectedTone,
          type: 'DESCRIPTION',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setGeneratedText(data.generation.generatedText);
      setActiveGenerationId(data.generation.id);

      toast.success('AI editorial description generated', {
        title: 'Copywriter Ready',
      });

      // Refresh history list
      if (onHistoryUpdate) {
        fetchHistory(activeProduct.id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while generating copy.');
      toast.error(err.message || 'Error generating copy');
    } finally {
      setIsGenerating(false);
    }
  };

  // 4. Publish to Storefront
  const handlePublish = async () => {
    if (!activeProduct) return;
    const textToPublish = generatedText || currentDescription;
    if (!textToPublish.trim()) return;

    setIsPublishing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/content/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: activeProduct.id,
          text: textToPublish,
          generationId: activeGenerationId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Publish failed');
      }

      // Update local state
      setCurrentDescription(textToPublish);
      activeProduct.description = textToPublish;
      setPublishSuccess(true);
      setTimeout(() => setPublishSuccess(false), 4000);

      toast.success(`Published description to "${activeProduct.name}"`, {
        title: 'Storefront Updated',
      });

      // Refresh history
      if (onHistoryUpdate) {
        fetchHistory(activeProduct.id);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to publish to storefront.');
      toast.error(err.message || 'Failed to publish copy');
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

  const handleCopy = () => {
    const text = generatedText || currentDescription;
    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2000);
  };

  const wordCount = (generatedText || currentDescription || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const charCount = (generatedText || currentDescription || '').length;

  if (!activeProduct) {
    return (
      <div className="border border-hairline bg-bg-deep p-8 text-center text-text-ondark/60">
        No active products found in catalog. Create a product first.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Control Header: Product & Tone Selector */}
      <div className="border border-hairline bg-bg-deep p-4 sm:p-6 rounded-md shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Product Picker */}
          <div className="lg:col-span-6 space-y-2">
            <label className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium flex items-center gap-2">
              <Layers size={14} /> Select Product to Write
            </label>
            <div className="relative">
              <select
                value={selectedProductId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full appearance-none bg-bg-primary border border-hairline px-4 py-3 text-sm text-text-ondark focus:border-accent-brass focus:outline-none transition-colors"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id} className="bg-bg-primary text-text-ondark">
                    {p.name} ({p.category}) — {brandConfig.currency.symbol}{p.basePrice}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tone Selector */}
          <div className="lg:col-span-6 space-y-2">
            <label className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium flex items-center gap-2">
              <Sliders size={14} /> Copywriting Tone
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['editorial', 'minimal', 'playful'] as CopyTone[]).map((tone) => {
                const isSelected = selectedTone === tone;
                return (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setSelectedTone(tone)}
                    className={`py-2.5 px-3 text-center text-xs transition-all border ${
                      isSelected
                        ? 'border-accent-brass bg-accent-brass/15 text-accent-brass font-medium shadow-sm'
                        : 'border-hairline bg-bg-primary/60 text-text-ondark/70 hover:border-text-ondark/30 hover:text-text-ondark'
                    }`}
                  >
                    <span className="capitalize block">{tone}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tone Description Subtitle */}
        <div className="mt-4 pt-4 border-t border-hairline flex items-center justify-between text-xs text-text-ondark/60 font-light">
          <p>
            <strong className="text-text-ondark font-normal capitalize">{selectedTone} Tone:</strong>{' '}
            {TONE_DEFINITIONS[selectedTone].description}
          </p>
          <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-accent-brass/90">
            <Sparkles size={12} /> Powered by Google Gemini 2.5 Flash
          </span>
        </div>
      </div>

      {/* 2. Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Product Context & Current Live Copy (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-hairline bg-bg-deep p-6 space-y-5">
            {/* Product Card Summary */}
            <div className="flex gap-4 items-start">
              <div className="relative h-20 w-16 bg-bg-primary shrink-0 border border-hairline overflow-hidden">
                <Image
                  src={activeProduct.image}
                  alt={activeProduct.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-accent-brass">
                    {activeProduct.category}
                  </span>
                  <Link
                    href={`/product/${activeProduct.slug}`}
                    target="_blank"
                    className="text-[11px] text-accent-brass hover:underline flex items-center gap-1"
                  >
                    View PDP <ExternalLink size={12} />
                  </Link>
                </div>
                <h3 className="font-serif text-lg text-text-ondark font-light truncate">
                  {activeProduct.name}
                </h3>
                <p className="text-xs text-text-ondark/60 font-light">
                  {brandConfig.currency.symbol}
                  {activeProduct.basePrice.toLocaleString()} · Status: {activeProduct.status}
                </p>
              </div>
            </div>

            {/* Current Storefront Copy Card */}
            <div className="border-t border-hairline pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.2em] text-text-ondark/60 font-medium">
                  Current Live PDP Description
                </span>
                {currentDescription ? (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20">
                    <CheckCircle2 size={10} /> Active on Storefront
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 border border-amber-500/20">
                    <AlertCircle size={10} /> Empty Description
                  </span>
                )}
              </div>

              <div className="bg-bg-primary/80 border border-hairline p-4 min-h-[160px] text-xs text-text-ondark/80 font-light leading-relaxed whitespace-pre-line">
                {currentDescription || (
                  <span className="italic text-text-ondark/40">
                    This product does not currently have a published description. Generate one using the AI writing partner.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: AI Generation Studio & Live Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border border-hairline bg-bg-deep p-6 space-y-4">
            {/* Header with Stats & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-hairline pb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-accent-brass" />
                <span className="text-xs font-serif text-text-ondark tracking-wide">
                  AI Product Copywriter
                </span>
                {activeGenerationId && (
                  <span className="text-[10px] uppercase tracking-wider text-accent-brass/80 bg-accent-brass/10 px-2 py-0.5 border border-accent-brass/20">
                    New Draft Generated
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-[11px] text-text-ondark/50">
                <span>{wordCount} words</span>
                <span>·</span>
                <span>{charCount} chars</span>
                <button
                  onClick={handleCopy}
                  title="Copy copy text"
                  className="hover:text-accent-brass text-text-ondark/70 flex items-center gap-1 ml-2 transition-colors"
                >
                  {copiedSuccess ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copiedSuccess ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 bg-red-900/20 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Banner */}
            {publishSuccess && (
              <div className="p-3 bg-emerald-900/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={14} />
                  <span>
                    Successfully published to PostgreSQL and revalidated live PDP!
                  </span>
                </div>
                <Link
                  href={`/product/${activeProduct.slug}`}
                  target="_blank"
                  className="underline underline-offset-2 text-emerald-200 hover:text-white"
                >
                  View Live →
                </Link>
              </div>
            )}

            {/* Live Copy Textarea */}
            <div className="relative">
              <textarea
                value={generatedText || currentDescription}
                onChange={(e) => setGeneratedText(e.target.value)}
                placeholder="Click 'Generate Copy' below to have Google Gemini write bespoke luxury editorial descriptions..."
                rows={8}
                disabled={isGenerating}
                className="w-full bg-bg-primary border border-hairline p-4 text-xs font-light text-text-ondark leading-relaxed focus:border-accent-brass focus:outline-none transition-colors resize-y disabled:opacity-50"
              />
              {isGenerating && (
                <div className="absolute inset-0 bg-bg-primary/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-accent-brass">
                  <RefreshCw size={24} className="animate-spin text-accent-brass" />
                  <span className="text-xs tracking-widest uppercase font-medium">
                    Crafting {selectedTone} Copy...
                  </span>
                </div>
              )}
            </div>

            {/* Bottom Actions Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-3">
              {/* Generate / Regenerate Action */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || isPublishing}
                className="flex items-center gap-2 px-5 py-2.5 bg-bg-primary hover:bg-bg-deep border border-accent-brass/50 text-accent-brass text-xs uppercase tracking-[0.2em] font-medium transition-all hover:border-accent-brass disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Generating...
                  </>
                ) : generatedText ? (
                  <>
                    <RefreshCw size={14} /> Regenerate Copy
                  </>
                ) : (
                  <>
                    <Sparkles size={14} /> Generate with Gemini
                  </>
                )}
              </button>

              {/* Publish Action */}
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing || isGenerating || (!generatedText && !currentDescription)}
                className={`flex items-center gap-2 px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-medium transition-all ${
                  publishSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-accent-brass text-bg-primary hover:bg-accent-brass-hover disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                {isPublishing ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Publishing...
                  </>
                ) : publishSuccess ? (
                  <>
                    <Check size={14} /> Published Live!
                  </>
                ) : (
                  <>
                    <UploadCloud size={14} /> Publish to Storefront
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
