'use client';

import React from 'react';
import { Star, CheckCircle2, Quote } from 'lucide-react';
import { content } from '@/config/content';

export interface TestimonialItem {
  id: string;
  author: string;
  location: string;
  rating: number;
  title: string;
  content: string;
  productName?: string;
  verified?: boolean;
  date?: string;
}

interface TestimonialsProps {
  items?: TestimonialItem[];
}

export function Testimonials({ items }: TestimonialsProps) {
  const { eyebrow, headline, subheadline, items: defaultItems } =
    content.home.testimonials;

  const reviewList = items && items.length > 0 ? items : defaultItems;

  return (
    <section className="w-full bg-bg-primary py-24 border-b border-hairline">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-16 space-y-3">
          <span className="text-[11px] uppercase tracking-[0.3em] text-accent-brass font-medium">
            {eyebrow}
          </span>
          <h2 className="font-serif text-3xl md:text-5xl font-light text-text-ondark tracking-tight">
            {headline}
          </h2>
          <p className="text-xs md:text-sm text-text-ondark/70 font-light max-w-lg mx-auto leading-relaxed">
            {subheadline}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviewList.map((review) => (
            <div
              key={review.id}
              className="relative flex flex-col justify-between rounded-md border border-hairline bg-bg-deep p-8 transition-all duration-300 hover:border-accent-brass/50 hover:bg-bg-deep/80 group shadow-sm hover:shadow-xl"
            >
              {/* Subtle luxury quotation mark watermark */}
              <div className="absolute top-6 right-6 text-accent-brass/10 group-hover:text-accent-brass/20 transition-colors">
                <Quote size={36} />
              </div>

              <div className="space-y-4">
                {/* 5-Star Rating */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < review.rating
                          ? 'fill-accent-brass text-accent-brass'
                          : 'text-text-ondark/20'
                      }
                    />
                  ))}
                </div>

                {/* Review Heading & Body */}
                <h3 className="font-serif text-lg font-light text-text-ondark leading-snug">
                  "{review.title}"
                </h3>
                <p className="text-xs md:text-sm text-text-ondark/75 font-light leading-relaxed">
                  {review.content}
                </p>
              </div>

              {/* Author & Verification Footer */}
              <div className="pt-8 mt-6 border-t border-hairline/60 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif text-sm font-medium text-text-ondark">
                      {review.author}
                    </span>
                    {review.verified !== false && (
                      <CheckCircle2 size={13} className="text-accent-brass" />
                    )}
                  </div>
                  <span className="text-[10px] text-text-ondark/50 tracking-wider font-sans">
                    {review.location}
                  </span>
                </div>

                {review.productName && (
                  <span className="text-[10px] uppercase tracking-wider text-accent-brass/80 font-mono bg-accent-brass/10 px-2.5 py-1 rounded-sm">
                    {review.productName}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
