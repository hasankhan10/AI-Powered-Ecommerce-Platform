'use client';

import React from 'react';
import { Sparkles, Headphones, ArrowRight } from 'lucide-react';
import { content } from '@/config/content';

const STYLIST_PROMPTS = [
  'Something for a summer wedding under ₹8000',
  'Breathable linen shirts for humid weather',
  'Understated evening dinner recommendations',
  'Minimalist home accents for modern living',
];

const SUPPORT_PROMPTS = [
  'Where is my order? (e.g. MV-ORD-...)',
  'What is your return and exchange policy?',
  'How long does express shipping take?',
  'I would like to speak with a human agent',
];

interface AssistantStarterPromptsProps {
  activeTab: 'stylist' | 'support';
  onSelectPrompt: (prompt: string) => void;
}

export function AssistantStarterPrompts({
  activeTab,
  onSelectPrompt,
}: AssistantStarterPromptsProps) {
  const prompts = activeTab === 'stylist' ? STYLIST_PROMPTS : SUPPORT_PROMPTS;

  return (
    <div className="space-y-6 pt-4">
      <div className="border border-hairline bg-bg-primary/50 p-4 space-y-2 rounded-md">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-accent-brass font-medium">
          {activeTab === 'stylist' ? <Sparkles size={13} /> : <Headphones size={13} />}
          {activeTab === 'stylist' ? 'Maison Vale Assistant' : 'Client Concierge'}
        </div>
        <p className="text-xs text-text-ondark/80 font-light leading-relaxed">
          {activeTab === 'stylist'
            ? content.assistant.welcomeMessage
            : content.support.welcomeMessage}
        </p>
      </div>

      {/* Starter prompts */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase tracking-[0.2em] text-accent-brass/80 font-medium block">
          Suggested Inquiries
        </span>
        <div className="flex flex-col gap-2">
          {prompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onSelectPrompt(prompt)}
              className="w-full text-left p-2.5 text-xs text-text-ondark/70 hover:text-text-ondark bg-bg-primary/30 hover:bg-bg-primary/70 border border-hairline hover:border-accent-brass/40 transition-colors flex items-center justify-between group rounded-md"
            >
              <span className="truncate pr-2 font-light">{prompt}</span>
              <ArrowRight
                size={12}
                className="text-accent-brass opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
