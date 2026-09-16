'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  X,
  Sparkles,
} from 'lucide-react';
import { useToastStore, ToastItem, ToastType } from '@/lib/store/useToast';

export function ToastContainer() {
  const { toasts, dismissToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2 sm:p-0"
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} toast={item} onDismiss={() => dismissToast(item.id)} />
      ))}
    </div>
  );
}

const TYPE_CONFIG: Record<
  ToastType,
  {
    icon: React.ReactNode;
    borderColor: string;
    glowColor: string;
    textColor: string;
    bgAccent: string;
    progressBarColor: string;
  }
> = {
  success: {
    icon: <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />,
    borderColor: 'border-emerald-500/40',
    glowColor: 'shadow-emerald-950/40 shadow-xl',
    textColor: 'text-emerald-300',
    bgAccent: 'bg-emerald-500/10',
    progressBarColor: 'bg-emerald-400',
  },
  error: {
    icon: <AlertCircle size={16} className="text-rose-400 shrink-0" />,
    borderColor: 'border-rose-500/40',
    glowColor: 'shadow-rose-950/40 shadow-xl',
    textColor: 'text-rose-300',
    bgAccent: 'bg-rose-500/10',
    progressBarColor: 'bg-rose-400',
  },
  warning: {
    icon: <AlertTriangle size={16} className="text-amber-400 shrink-0" />,
    borderColor: 'border-amber-500/40',
    glowColor: 'shadow-amber-950/40 shadow-xl',
    textColor: 'text-amber-300',
    bgAccent: 'bg-amber-500/10',
    progressBarColor: 'bg-amber-400',
  },
  info: {
    icon: <Sparkles size={16} className="text-accent-brass shrink-0" />,
    borderColor: 'border-accent-brass/40',
    glowColor: 'shadow-accent-brass/10 shadow-xl',
    textColor: 'text-accent-brass',
    bgAccent: 'bg-accent-brass/10',
    progressBarColor: 'bg-accent-brass',
  },
  loading: {
    icon: <RefreshCw size={16} className="text-accent-brass animate-spin shrink-0" />,
    borderColor: 'border-accent-brass/40',
    glowColor: 'shadow-accent-brass/10 shadow-xl',
    textColor: 'text-accent-brass',
    bgAccent: 'bg-accent-brass/10',
    progressBarColor: 'bg-accent-brass',
  },
};

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const [progress, setProgress] = useState(100);
  const config = TYPE_CONFIG[toast.type] || TYPE_CONFIG.info;

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / toast.duration!) * 100);
      setProgress(remaining);

      if (elapsed >= toast.duration!) {
        clearInterval(interval);
        onDismiss();
      }
    }, 25);

    return () => clearInterval(interval);
  }, [toast.duration, onDismiss]);

  return (
    <div
      role="alert"
      className={`pointer-events-auto relative overflow-hidden bg-bg-deep/95 backdrop-blur-xl border ${config.borderColor} ${config.glowColor} text-text-ondark rounded-md p-3.5 sm:p-4 transition-all duration-300 animate-in slide-in-from-bottom-3 fade-in`}
    >
      <div className="flex items-start gap-3">
        {/* Status Icon with soft ambient aura */}
        <div className={`p-1.5 rounded ${config.bgAccent}`}>
          {config.icon}
        </div>

        {/* Content Details */}
        <div className="flex-1 min-w-0 pr-2">
          {toast.title && (
            <h5 className={`font-serif text-xs font-medium tracking-wide ${config.textColor} mb-0.5`}>
              {toast.title}
            </h5>
          )}
          <p className="text-xs text-text-ondark/90 font-light leading-relaxed break-words">
            {toast.message}
          </p>

          {/* Action button if provided */}
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action?.onClick();
                onDismiss();
              }}
              className="mt-2 text-[11px] font-medium text-accent-brass underline underline-offset-2 hover:text-accent-brass/80 transition-colors uppercase tracking-wider block"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Dismiss X button */}
        <button
          type="button"
          onClick={onDismiss}
          className="text-text-ondark/40 hover:text-text-ondark transition-colors p-1 -mr-1 -mt-1 rounded"
          aria-label="Close notification"
        >
          <X size={14} />
        </button>
      </div>

      {/* Animated Countdown Progress Bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5 overflow-hidden">
          <div
            className={`h-full ${config.progressBarColor} transition-all duration-75 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
