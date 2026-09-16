'use client';

import React, { useState } from 'react';
import { Truck, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { content } from '@/config/content';

interface ProductAccordionInfoProps {
  description: string;
}

export function ProductAccordionInfo({ description }: ProductAccordionInfoProps) {
  const [openTab, setOpenTab] = useState<'desc' | 'details' | null>('desc');

  return (
    <div className="space-y-4">
      {/* Value Props */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-hairline text-xs text-text-ondark/70">
        <div className="flex items-center gap-2.5">
          <Truck size={16} className="text-accent-brass shrink-0" />
          <span className="font-light">{content.product.freeShipping}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <RotateCcw size={16} className="text-accent-brass shrink-0" />
          <span className="font-light">{content.product.returnPolicy}</span>
        </div>
      </div>

      {/* Accordion Tabs */}
      <div className="border-t border-hairline divide-y divide-hairline">
        {/* Description Tab */}
        <div className="py-4">
          <button
            type="button"
            onClick={() => setOpenTab(openTab === 'desc' ? null : 'desc')}
            className="w-full flex items-center justify-between text-xs uppercase tracking-wider text-text-ondark hover:text-accent-brass transition-colors cursor-pointer"
          >
            <span>{content.product.descriptionTab}</span>
            {openTab === 'desc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {openTab === 'desc' && (
            <p className="mt-3 text-xs text-text-ondark/70 font-light leading-relaxed">
              {description ||
                'Crafted with intentional precision from artisanal materials. Every piece is constructed to honor raw texture and effortless silhouette.'}
            </p>
          )}
        </div>

        {/* Details & Care Tab */}
        <div className="py-4">
          <button
            type="button"
            onClick={() => setOpenTab(openTab === 'details' ? null : 'details')}
            className="w-full flex items-center justify-between text-xs uppercase tracking-wider text-text-ondark hover:text-accent-brass transition-colors cursor-pointer"
          >
            <span>{content.product.detailsTab}</span>
            {openTab === 'details' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {openTab === 'details' && (
            <div className="mt-3 text-xs text-text-ondark/70 font-light leading-relaxed space-y-2">
              <p>• Handcrafted from 100% natural fibres in Indian ateliers.</p>
              <p>• Dry clean or gentle hand wash in cold water with mild detergent.</p>
              <p>• Lay flat to dry in shade to preserve textile structure.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
