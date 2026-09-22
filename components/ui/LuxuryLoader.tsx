'use client';

import React from 'react';
import { brandConfig } from '@/config/brand.config';

interface LuxuryLoaderProps {
  label?: string;
  sublabel?: string;
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  className?: string;
}

export function LuxuryLoader({
  label = 'Loading...',
  sublabel = brandConfig.name,
  size = 'md',
  className = '',
}: LuxuryLoaderProps) {
  if (size === 'fullscreen') {
    return (
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-primary/95 backdrop-blur-sm transition-all duration-300 ${className}`}
      >
        <LuxuryLoaderInner label={label} sublabel={sublabel} size={size} />
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}
    >
      <LuxuryLoaderInner label={label} sublabel={sublabel} size={size} />
    </div>
  );
}

function LuxuryLoaderInner({
  label,
  sublabel,
  size,
}: {
  label: string;
  sublabel?: string;
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
}) {
  const isSmall = size === 'sm';

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Minimalist, Clean Luxury Hairline Ring */}
      <div className="relative flex items-center justify-center">
        {/* Subtle static hairline track ring */}
        <div
          className={`${
            isSmall ? 'h-7 w-7 border' : 'h-11 w-11 border-[1.5px]'
          } rounded-full border-hairline/80`}
        />

        {/* Delicate golden spinning arc */}
        <div
          className={`absolute inset-0 ${
            isSmall ? 'h-7 w-7 border' : 'h-11 w-11 border-[1.5px]'
          } rounded-full border-transparent border-t-accent-brass animate-spin`}
          style={{ animationDuration: '1.1s' }}
        />

        {/* Quiet central brass micro-dot */}
        <div
          className={`${
            isSmall ? 'h-1 w-1' : 'h-1.5 w-1.5'
          } rounded-full bg-accent-brass/80`}
        />
      </div>

      {/* Elegant, Quiet Luxury Typography */}
      <div className="space-y-1 text-center">
        {sublabel && (
          <span className="block text-[9px] uppercase tracking-[0.3em] text-accent-brass/80 font-medium">
            {sublabel}
          </span>
        )}
        <h4
          className={`font-serif ${
            isSmall ? 'text-xs' : 'text-sm'
          } font-light text-text-ondark/90 tracking-wide`}
        >
          {label}
        </h4>
      </div>
    </div>
  );
}

export { ProductCardSkeleton } from '@/components/ui/Skeleton';
