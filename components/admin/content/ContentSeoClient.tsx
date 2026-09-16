'use client';

import React, { useState } from 'react';
import { Sparkles, FileText, Search, Layers, Clock } from 'lucide-react';
import { ContentProductItem, GenerationHistoryItem } from '@/lib/db/content';
import { ProductContentGenerator } from './ProductContentGenerator';
import { ProductSeoGenerator } from './ProductSeoGenerator';
import { ContentHistoryTable } from './ContentHistoryTable';

interface ContentSeoClientProps {
  products: ContentProductItem[];
  initialHistory: GenerationHistoryItem[];
  stats: {
    totalGenerations: number;
    publishedCount: number;
    editorialCount: number;
    minimalCount: number;
    playfulCount: number;
  };
}

export function ContentSeoClient({
  products,
  initialHistory,
  stats,
}: ContentSeoClientProps) {
  const [activeTab, setActiveTab] = useState<'copy' | 'seo'>('copy');
  const [history, setHistory] = useState<GenerationHistoryItem[]>(initialHistory);

  const handleHistoryUpdate = (newHistory: GenerationHistoryItem[]) => {
    setHistory(newHistory);
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* 1. Header Section */}
      <div className="border-b border-hairline pb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-accent-brass font-medium">
            Copywriting & SEO Engine
          </span>
          <h1 className="font-serif text-3xl font-light text-text-ondark tracking-tight mt-1">
            AI Content & SEO Studio
          </h1>
        </div>

        {/* Quick Stats Badges */}
        <div className="flex items-center gap-3">
          <div className="border border-hairline bg-bg-deep px-3.5 py-1.5 text-center">
            <span className="text-[9px] uppercase tracking-widest text-text-ondark/50 block">
              Generations
            </span>
            <span className="font-serif text-sm font-light text-text-ondark">
              {history.length}
            </span>
          </div>

          <div className="border border-hairline bg-bg-deep px-3.5 py-1.5 text-center">
            <span className="text-[9px] uppercase tracking-widest text-text-ondark/50 block">
              Published
            </span>
            <span className="font-serif text-sm font-light text-emerald-400">
              {history.filter((h) => h.isPublished).length}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Studio Tabs (Copywriting vs SEO Optimizer) */}
      <div className="flex items-center gap-2 border-b border-hairline pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('copy')}
          className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-[0.2em] font-medium border-b-2 transition-all ${
            activeTab === 'copy'
              ? 'border-accent-brass text-accent-brass bg-bg-deep/40'
              : 'border-transparent text-text-ondark/60 hover:text-text-ondark'
          }`}
        >
          <Sparkles size={14} /> Product Copywriter
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('seo')}
          className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-[0.2em] font-medium border-b-2 transition-all ${
            activeTab === 'seo'
              ? 'border-accent-brass text-accent-brass bg-bg-deep/40'
              : 'border-transparent text-text-ondark/60 hover:text-text-ondark'
          }`}
        >
          <Search size={14} /> SEO & Metadata Optimizer
        </button>
      </div>

      {/* 3. Studio Card Rendering */}
      {activeTab === 'copy' ? (
        <ProductContentGenerator
          products={products}
          initialHistory={history}
          onHistoryUpdate={handleHistoryUpdate}
        />
      ) : (
        <ProductSeoGenerator
          products={products}
          initialHistory={history}
          onHistoryUpdate={handleHistoryUpdate}
        />
      )}

      {/* 4. Generation History Table */}
      <ContentHistoryTable history={history} />
    </div>
  );
}
