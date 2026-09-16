'use client';

import React from 'react';
import { Eye, Bell } from 'lucide-react';

interface ProductSocialProofSectionProps {
  enableSocialProof: boolean;
  onToggleSocialProof: () => void;
}

export function ProductSocialProofSection({
  enableSocialProof,
  onToggleSocialProof,
}: ProductSocialProofSectionProps) {
  return (
    <div className="space-y-4 border-t border-hairline/60 pt-6">
      <div className="flex items-center justify-between border-b border-hairline/60 pb-2">
        <h3 className="text-xs uppercase tracking-[0.2em] text-accent-brass font-medium flex items-center gap-1.5">
          <Eye size={13} /> 5. Live Social Proof & Urgency Simulation
        </h3>
        <span
          className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
            enableSocialProof
              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
              : 'bg-red-950/40 text-red-400 border border-red-500/30'
          }`}
        >
          {enableSocialProof ? 'Simulation Active' : 'Simulation Disabled'}
        </span>
      </div>

      <div className="p-4 border border-hairline bg-bg-deep rounded-md space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <label
              htmlFor="toggle-simulation"
              className="text-xs font-medium text-text-ondark cursor-pointer"
            >
              Enable Live Viewers & Recent Purchase Popups
            </label>
            <p className="text-[11px] text-text-ondark/60 font-light leading-relaxed">
              Displays dynamic live viewer counts (e.g. &ldquo;13 patrons viewing this piece&rdquo;) and periodic verified order toasts (every 10–12s from luxury Indian cities) on this product&apos;s details page to enhance patron interest and conversion.
            </p>
          </div>

          <button
            id="toggle-simulation"
            type="button"
            onClick={onToggleSocialProof}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              enableSocialProof ? 'bg-accent-brass' : 'bg-bg-primary border-hairline'
            }`}
            role="switch"
            aria-checked={enableSocialProof}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-bg-deep shadow ring-0 transition duration-200 ease-in-out ${
                enableSocialProof ? 'translate-x-5 bg-bg-primary' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Simulation Feature Preview */}
        {enableSocialProof && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-hairline/40 text-xs">
            <div className="flex items-center gap-2.5 p-2.5 bg-bg-primary border border-hairline rounded">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-text-ondark/80 text-[11px]">
                <strong>13 patrons</strong> viewing this piece right now
              </span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 bg-bg-primary border border-hairline rounded">
              <Bell size={13} className="text-accent-brass shrink-0" />
              <span className="text-text-ondark/80 text-[11px] truncate">
                <strong>Ananya D.</strong> in Mumbai recently purchased
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
