'use client';

import React from 'react';
import { Send } from 'lucide-react';
import { content } from '@/config/content';

interface AssistantInputBarProps {
  input: string;
  isLoading: boolean;
  activeTab: 'stylist' | 'support';
  inputRef: React.RefObject<HTMLInputElement | null>;
  onInputChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AssistantInputBar({
  input,
  isLoading,
  activeTab,
  inputRef,
  onInputChange,
  onSubmit,
}: AssistantInputBarProps) {
  return (
    <div className="border-t border-hairline p-4 bg-bg-primary/40">
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 bg-bg-deep border border-hairline px-3 py-2 focus-within:border-accent-brass transition-colors rounded-md"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={activeTab === 'stylist' ? content.assistant.placeholder : content.support.placeholder}
          disabled={isLoading}
          className="flex-1 bg-transparent text-xs text-text-ondark placeholder-text-ondark/30 focus:outline-none font-light"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="text-accent-brass hover:text-accent-brass-hover disabled:text-text-ondark/20 p-1 transition-colors rounded-md cursor-pointer"
          aria-label="Send message"
        >
          <Send size={15} />
        </button>
      </form>

      <p className="mt-2 text-[9px] text-center text-text-ondark/30 font-light">
        AI responses may occasionally vary. Powered by Google Gemini 2.5.
      </p>
    </div>
  );
}
