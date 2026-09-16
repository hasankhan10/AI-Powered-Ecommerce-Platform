import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: MetricCardProps) {
  return (
    <div className="border border-hairline bg-bg-deep p-4 sm:p-6 space-y-3 sm:space-y-4 rounded-md shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium truncate pr-2">
          {title}
        </span>
        <div className="flex h-8 w-8 items-center justify-center border border-hairline bg-bg-primary text-text-ondark/60 rounded-md shrink-0">
          <Icon size={16} className="text-accent-brass" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="font-serif text-2xl sm:text-3xl font-light text-text-ondark tracking-tight truncate">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-text-ondark/60 font-light">{subtitle}</p>
        )}
      </div>

      {trend && (
        <div className="pt-2 border-t border-hairline text-[11px] text-emerald-400 font-mono">
          {trend}
        </div>
      )}
    </div>
  );
}
