'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, RefreshCw, UploadCloud, Check, Copy, CheckCircle2, AlertCircle } from 'lucide-react';

interface AiCopyEditorProps {
  productSlug: string;
  generatedText: string;
  currentDescription: string;
  activeGenerationId: string | null;
  selectedTone: string;
  isGenerating: boolean;
  isPublishing: boolean;
  publishSuccess: boolean;
  copiedSuccess: boolean;
  errorMessage: string | null;
  wordCount: number;
  charCount: number;
  onTextChange: (text: string) => void;
  onCopy: () => void;
  onGenerate: () => void;
  onPublish: () => void;
}

export function AiCopyEditor({
  productSlug,
  generatedText,
  currentDescription,
  activeGenerationId,
  selectedTone,
  isGenerating,
  isPublishing,
  publishSuccess,
  copiedSuccess,
  errorMessage,
  wordCount,
  charCount,
  onTextChange,
  onCopy,
  onGenerate,
  onPublish,
}: AiCopyEditorProps) {
  return (
    <div className="border border-hairline bg-bg-deep p-6 space-y-4 rounded-md shadow-sm">
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
            onClick={onCopy}
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
            href={`/product/${productSlug}`}
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
          onChange={(e) => onTextChange(e.target.value)}
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
          onClick={onGenerate}
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
          onClick={onPublish}
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
  );
}
