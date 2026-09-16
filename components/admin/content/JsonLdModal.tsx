'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface JsonLdModalProps {
  isOpen: boolean;
  jsonData: any;
  onClose: () => void;
}

export function JsonLdModal({ isOpen, jsonData, onClose }: JsonLdModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-bg-deep/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-bg-deep border border-hairline max-w-2xl w-full p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <h3 className="font-serif text-lg text-text-ondark">
            Schema.org JSON-LD Product Markup
          </h3>
          <button
            onClick={onClose}
            className="text-text-ondark/60 hover:text-text-ondark text-xs uppercase tracking-wider cursor-pointer"
          >
            Close
          </button>
        </div>

        <pre className="bg-bg-primary p-4 text-[11px] font-mono text-text-ondark/80 overflow-x-auto max-h-96 border border-hairline">
          {JSON.stringify(jsonData, null, 2)}
        </pre>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent-brass text-bg-primary text-xs uppercase tracking-wider font-medium cursor-pointer"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy JSON-LD'}
          </button>
        </div>
      </div>
    </div>
  );
}
