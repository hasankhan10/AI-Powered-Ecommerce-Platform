'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles, MessageSquare, X } from 'lucide-react';
import { useAssistantStore } from '@/lib/store/useAssistantStore';
import { useCartStore } from '@/lib/store/useCartStore';

export function AssistantFloatingTrigger() {
  const pathname = usePathname();
  const { isOpen: isAssistantOpen, openAssistant } = useAssistantStore();
  const { isOpen: isCartOpen } = useCartStore();
  const [showPopup, setShowPopup] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Show popup message 5 seconds after landing on the page
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Hide floating assistant trigger entirely on admin dashboard pages
  if (pathname?.startsWith('/admin')) return null;

  if (isAssistantOpen || isCartOpen) return null;

  const handleOpen = () => {
    setShowPopup(false);
    openAssistant();
  };

  const handleDismissPopup = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPopup(false);
    setIsDismissed(true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-auto">
      {/* 4-Second Proactive Speech Bubble Popup */}
      {showPopup && !isDismissed && (
        <div
          onClick={handleOpen}
          className="mb-3 relative max-w-xs cursor-pointer rounded-lg border border-accent-brass/60 bg-bg-deep/95 p-4 shadow-2xl backdrop-blur-md transition-all duration-300 hover:border-accent-brass hover:bg-bg-primary animate-in fade-in slide-in-from-bottom-3"
        >
          {/* Close button */}
          <button
            onClick={handleDismissPopup}
            className="absolute top-2 right-2 p-1 text-text-ondark/50 hover:text-accent-brass transition-colors"
            aria-label="Dismiss message"
          >
            <X size={12} />
          </button>

          <div className="flex items-start gap-3 pr-4">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-brass/20 text-accent-brass">
              <Sparkles size={12} className="text-accent-brass animate-pulse" />
            </div>
            <div className="space-y-1">
              <span className="block text-[9px] uppercase tracking-[0.2em] text-accent-brass font-medium">
                Maison Assistant
              </span>
              <p className="font-serif text-sm font-light text-text-ondark">
                What do you want to buy?
              </p>
              <span className="block text-[10px] text-text-ondark/60 tracking-wide font-sans pt-0.5">
                Click to chat with your personal AI concierge →
              </span>
            </div>
          </div>

          {/* Pointer caret arrow pointing directly to the circle button */}
          <div className="absolute -bottom-1.5 right-5 h-3 w-3 rotate-45 border-r border-b border-accent-brass/60 bg-bg-deep/95" />
        </div>
      )}

      {/* Floating Chat Trigger Button (Only Chat Icon) */}
      <button
        type="button"
        onClick={handleOpen}
        className="group relative flex h-[52px] w-[52px] items-center justify-center rounded-full bg-bg-deep/95 text-accent-brass border border-accent-brass/60 shadow-2xl backdrop-blur-md hover:border-accent-brass hover:bg-bg-primary hover:scale-105 active:scale-95 transition-all duration-300 focus:outline-none"
        aria-label="Open AI Assistant"
        title="AI Assistant"
      >
        {/* Subtle Ambient Glow */}
        <span className="absolute -inset-1 rounded-full bg-accent-brass/20 blur opacity-40 group-hover:opacity-100 transition duration-300 pointer-events-none" />

        {/* Pulse Notification Ping */}
        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-brass opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-brass" />
        </span>

        {/* Chat Icon */}
        <div className="relative flex items-center justify-center">
          <MessageSquare
            size={22}
            className="text-accent-brass group-hover:rotate-6 transition-transform duration-200"
          />
        </div>
      </button>
    </div>
  );
}
