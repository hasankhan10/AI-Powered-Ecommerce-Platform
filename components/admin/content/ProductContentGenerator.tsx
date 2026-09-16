'use client';

import React, { useState } from 'react';
import { toast } from '@/lib/store/useToast';
import { ContentProductItem, GenerationHistoryItem } from '@/lib/db/content';
import { CopyTone } from '@/lib/ai/copywriter';
import { ContentSelectorBar } from './ContentSelectorBar';
import { ProductLiveCopyPreview } from './ProductLiveCopyPreview';
import { AiCopyEditor } from './AiCopyEditor';

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
      <ContentSelectorBar
        products={products}
        selectedProductId={selectedProductId}
        selectedTone={selectedTone}
        onProductChange={handleProductChange}
        onToneChange={setSelectedTone}
      />

      {/* 2. Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Product Context & Current Live Copy (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <ProductLiveCopyPreview
            product={activeProduct}
            currentDescription={currentDescription}
          />
        </div>

        {/* Right: AI Generation Studio & Live Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <AiCopyEditor
            productSlug={activeProduct.slug}
            generatedText={generatedText}
            currentDescription={currentDescription}
            activeGenerationId={activeGenerationId}
            selectedTone={selectedTone}
            isGenerating={isGenerating}
            isPublishing={isPublishing}
            publishSuccess={publishSuccess}
            copiedSuccess={copiedSuccess}
            errorMessage={errorMessage}
            wordCount={wordCount}
            charCount={charCount}
            onTextChange={setGeneratedText}
            onCopy={handleCopy}
            onGenerate={handleGenerate}
            onPublish={handlePublish}
          />
        </div>
      </div>
    </div>
  );
}
