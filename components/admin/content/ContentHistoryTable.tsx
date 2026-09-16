'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
  UploadCloud,
  RefreshCw,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { GenerationHistoryItem } from '@/lib/db/content';

interface ContentHistoryTableProps {
  history: GenerationHistoryItem[];
  onApplyGeneration?: (item: GenerationHistoryItem) => void;
}

export function ContentHistoryTable({
  history: initialHistory,
  onApplyGeneration,
}: ContentHistoryTableProps) {
  const [history, setHistory] = useState<GenerationHistoryItem[]>(initialHistory);
  const [filterTone, setFilterTone] = useState<string>('ALL');
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync state if initialHistory changes
  React.useEffect(() => {
    setHistory(initialHistory);
  }, [initialHistory]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePublishHistoryItem = async (item: GenerationHistoryItem) => {
    setPublishingId(item.id);
    try {
      const res = await fetch('/api/admin/content/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: item.productId,
          text: item.generatedText,
          generationId: item.id,
        }),
      });

      if (res.ok) {
        setHistory((prev) =>
          prev.map((g) =>
            g.id === item.id
              ? { ...g, isPublished: true, publishedAt: new Date().toISOString() }
              : g
          )
        );
      }
    } catch (err) {
      console.error('Failed to publish history item:', err);
    } finally {
      setPublishingId(null);
    }
  };

  const filteredHistory = history.filter((item) => {
    if (filterTone === 'ALL') return true;
    return item.tone?.toLowerCase() === filterTone.toLowerCase();
  });

  const getToneBadge = (tone: string | null) => {
    switch (tone?.toLowerCase()) {
      case 'editorial':
        return (
          <span className="text-[10px] uppercase tracking-wider text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5">
            Editorial
          </span>
        );
      case 'minimal':
        return (
          <span className="text-[10px] uppercase tracking-wider text-sky-300 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5">
            Minimal
          </span>
        );
      case 'playful':
        return (
          <span className="text-[10px] uppercase tracking-wider text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5">
            Playful
          </span>
        );
      default:
        return (
          <span className="text-[10px] uppercase tracking-wider text-text-ondark/60 bg-bg-primary px-2 py-0.5 border border-hairline">
            Standard
          </span>
        );
    }
  };

  return (
    <div className="border border-hairline bg-bg-deep rounded-md shadow-sm overflow-hidden">
      {/* Header & Tone Filters */}
      <div className="p-4 sm:p-6 border-b border-hairline flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium flex items-center gap-1.5">
            <Clock size={12} /> Generation Logs
          </span>
          <h3 className="font-serif text-lg text-text-ondark font-light mt-0.5">
            AI Copywriting History ({filteredHistory.length})
          </h3>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <Filter size={13} className="text-text-ondark/40" />
          {['ALL', 'editorial', 'minimal', 'playful'].map((tone) => (
            <button
              key={tone}
              onClick={() => setFilterTone(tone)}
              className={`text-xs px-3 py-1 border transition-all capitalize ${
                filterTone.toLowerCase() === tone.toLowerCase()
                  ? 'border-accent-brass bg-accent-brass/10 text-accent-brass font-medium'
                  : 'border-hairline text-text-ondark/60 hover:text-text-ondark'
              }`}
            >
              {tone === 'ALL' ? 'All Tones' : tone}
            </button>
          ))}
        </div>
      </div>

      {/* Table List */}
      {filteredHistory.length === 0 ? (
        <div className="p-12 text-center text-xs text-text-ondark/50 space-y-2">
          <Sparkles size={24} className="mx-auto text-accent-brass/40" />
          <p>No content generations recorded yet.</p>
          <p className="text-[11px] text-text-ondark/40">
            Use the copywriting studio above to generate your first AI description.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-hairline bg-bg-primary/50 text-[10px] uppercase tracking-[0.2em] text-text-ondark/60 font-medium">
                <th className="py-3.5 px-6">Product</th>
                <th className="py-3.5 px-4">Tone</th>
                <th className="py-3.5 px-4">Generated Copy Snippet</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filteredHistory.map((item) => {
                const isItemPublishing = publishingId === item.id;
                const isCopied = copiedId === item.id;
                const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-bg-primary/40 transition-colors group"
                  >
                    {/* Product */}
                    <td className="py-4 px-6 font-medium text-text-ondark whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{item.productName}</span>
                        {item.productSlug && (
                          <Link
                            href={`/product/${item.productSlug}`}
                            target="_blank"
                            className="text-accent-brass/70 hover:text-accent-brass"
                          >
                            <ExternalLink size={12} />
                          </Link>
                        )}
                      </div>
                    </td>

                    {/* Tone */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {getToneBadge(item.tone)}
                    </td>

                    {/* Excerpt */}
                    <td className="py-4 px-4 max-w-md">
                      <p className="text-text-ondark/70 line-clamp-2 font-light leading-relaxed">
                        {item.generatedText}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      {item.isPublished ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5">
                          <CheckCircle2 size={11} /> Published
                        </span>
                      ) : (
                        <span className="text-[10px] text-text-ondark/40 bg-bg-primary border border-hairline px-2 py-0.5">
                          Draft
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 whitespace-nowrap text-[11px] text-text-ondark/50 font-light">
                      {formattedDate}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopy(item.id, item.generatedText)}
                          title="Copy copy"
                          className="p-1.5 text-text-ondark/60 hover:text-accent-brass border border-hairline hover:border-accent-brass/40 transition-colors"
                        >
                          {isCopied ? (
                            <Check size={13} className="text-emerald-400" />
                          ) : (
                            <Copy size={13} />
                          )}
                        </button>

                        {!item.isPublished ? (
                          <button
                            type="button"
                            onClick={() => handlePublishHistoryItem(item)}
                            disabled={isItemPublishing}
                            className="flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase tracking-wider bg-accent-brass text-bg-primary hover:bg-accent-brass-hover font-medium transition-colors disabled:opacity-50"
                          >
                            {isItemPublishing ? (
                              <>
                                <RefreshCw size={11} className="animate-spin" /> Publishing
                              </>
                            ) : (
                              <>
                                <UploadCloud size={11} /> Publish
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-medium px-2 py-1">
                            Active
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
