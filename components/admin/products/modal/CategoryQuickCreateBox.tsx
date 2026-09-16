'use client';

import React from 'react';
import { FolderPlus, X } from 'lucide-react';

interface CategoryQuickCreateBoxProps {
  isOpen: boolean;
  categoryName: string;
  creating: boolean;
  error: string | null;
  onNameChange: (val: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CategoryQuickCreateBox({
  isOpen,
  categoryName,
  creating,
  error,
  onNameChange,
  onClose,
  onSubmit,
}: CategoryQuickCreateBoxProps) {
  if (!isOpen) return null;

  return (
    <div className="p-3.5 border border-accent-brass/40 bg-accent-brass/5 rounded-sm space-y-2.5 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-accent-brass flex items-center gap-1.5 uppercase tracking-wider">
          <FolderPlus size={13} /> Add New Category
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-text-ondark/40 hover:text-text-ondark text-xs"
        >
          <X size={14} />
        </button>
      </div>

      {error && (
        <p className="text-[11px] text-red-400 bg-red-950/40 p-1.5 border border-red-500/30">
          {error}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={categoryName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g. Footwear, Outerwear, Jewellery"
          className="flex-1 border border-hairline bg-bg-deep px-3 py-2 text-xs text-text-ondark placeholder-text-ondark/30 focus:border-accent-brass focus:outline-none"
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={creating || !categoryName.trim()}
          className="bg-accent-brass text-bg-primary hover:bg-accent-brass-hover px-4 py-2 text-xs uppercase tracking-wider font-medium transition-colors disabled:opacity-40 shrink-0"
        >
          {creating ? 'Saving...' : 'Save & Select'}
        </button>
      </div>
    </div>
  );
}
