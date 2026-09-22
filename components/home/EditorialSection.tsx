'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import { content } from '@/config/content';
import { FadeInView } from '@/components/ui/FadeInView';

export function EditorialSection() {
  return (
    <section className="w-full bg-bg-deep py-28 border-b border-hairline overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left: Story Content with Slide-in-from-left */}
          <FadeInView
            direction="left"
            distance={36}
            duration={0.9}
            className="lg:col-span-6 space-y-8"
          >
            <div className="inline-flex items-center gap-2 border border-hairline bg-bg-primary px-3.5 py-1.5 text-[10px] uppercase tracking-[0.25em] text-accent-brass rounded-full">
              <Sparkles size={12} />
              <span>{content.home.editorial.eyebrow}</span>
            </div>

            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-text-ondark leading-[1.08] tracking-tight">
              {content.home.editorial.headline}
            </h2>

            <p className="text-sm md:text-base text-text-ondark/70 font-light leading-relaxed tracking-wide max-w-xl">
              {content.home.editorial.body}
            </p>

            <div className="pt-4">
              <Link
                href="/story"
                className="inline-flex items-center gap-3 border border-hairline bg-bg-primary px-8 py-4 text-xs uppercase tracking-[0.25em] font-medium text-text-ondark hover:border-accent-brass transition-all duration-300 rounded-md shadow-sm hover:shadow-accent-brass/10"
              >
                {content.home.editorial.cta}
                <ArrowRight size={14} className="text-accent-brass" />
              </Link>
            </div>
          </FadeInView>

          {/* Right: Editorial Image Collage with Slide-in-from-right */}
          <FadeInView
            direction="right"
            distance={36}
            duration={0.9}
            delay={0.15}
            className="lg:col-span-6 relative"
          >
            <div className="relative aspect-[4/5] w-full border border-hairline bg-bg-primary overflow-hidden rounded-lg shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&q=80"
                alt="Maison Vale Craft Heritage"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-deep/90 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-8 left-8 right-8 border border-hairline bg-bg-primary/80 backdrop-blur-md p-6 space-y-2 rounded-md">
                <span className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium">
                  Atelier Pondicherry
                </span>
                <p className="text-xs text-text-ondark/80 font-light leading-relaxed">
                  Hand-loomed natural linen & Mulberry silk crafted with quiet precision.
                </p>
              </div>
            </div>
          </FadeInView>
        </div>
      </div>
    </section>
  );
}
