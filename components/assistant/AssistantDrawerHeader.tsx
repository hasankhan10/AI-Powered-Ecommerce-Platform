'use client';

import React from 'react';
import { Sparkles, Headphones, RotateCcw, X } from 'lucide-react';
import { brandConfig } from '@/config/brand.config';
import { content } from '@/config/content';

export type AssistantTab = 'stylist' | 'support';

interface AssistantDrawerHeaderProps {
  activeTab: AssistantTab;
  hasMessages: boolean;
  onTabChange: (tab: AssistantTab) => void;
  onClear: () => void;
  onClose: () => void;
}

export function AssistantDrawerHeader({
  activeTab,
  hasMessages,
  onTabChange,
  onClear,
  onClose,
}: AssistantDrawerHeaderProps) {
  return (
    <div className="border-b border-hairline bg-bg-primary/40">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-brass/15 border border-accent-brass/40 flex items-center justify-center text-accent-brass">
            {activeTab === 'stylist' ? <Sparkles size={15} /> : <Headphones size={15} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-sm tracking-wide text-text-ondark">
                {activeTab === 'stylist' ? content.assistant.title : 'Client Concierge'}
              </h3>
              <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-[10px] text-text-ondark/50 font-light">
              {brandConfig.name} Automated Assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasMessages && (
            <button
              type="button"
              onClick={onClear}
              className="text-text-ondark/40 hover:text-accent-brass p-1.5 transition-colors rounded-md"
              title="Clear conversation"
            >
              <RotateCcw size={15} />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-text-ondark/40 hover:text-text-ondark p-1.5 transition-colors rounded-md"
            aria-label="Close Assistant"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 border-t border-hairline text-xs font-medium tracking-wider uppercase">
        <button
          type="button"
          onClick={() => onTabChange('stylist')}
          className={`py-2 text-center transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'stylist'
              ? 'bg-accent-brass/10 text-accent-brass border-b-2 border-accent-brass'
              : 'text-text-ondark/50 hover:text-text-ondark'
          }`}
        >
          <Sparkles size={12} /> Shopping Assistant
        </button>
        <button
          type="button"
          onClick={() => onTabChange('support')}
          className={`py-2 text-center transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'support'
              ? 'bg-accent-brass/10 text-accent-brass border-b-2 border-accent-brass'
              : 'text-text-ondark/50 hover:text-text-ondark'
          }`}
        >
          <Headphones size={12} /> Orders & Support
        </button>
      </div>
    </div>
  );
}
