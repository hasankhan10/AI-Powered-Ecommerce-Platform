'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { brandConfig } from '@/config/brand.config';
import { content } from '@/config/content';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 286;

const getFrameSrc = (index: number) => {
  const frameNum = String(index + 1).padStart(3, '0');
  return `/hero-frames/ezgif-7f03cba42f55389b-jpg/ezgif-frame-${frameNum}.jpg`;
};

export function ScrollHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phase1Ref = useRef<HTMLDivElement>(null);
  const phase2Ref = useRef<HTMLDivElement>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setIsReducedMotion(prefersReduced);

    if (prefersReduced || !containerRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Cache preloaded images
    const images: HTMLImageElement[] = [];
    let currentFrameIndex = 0;

    // Render frame with cover aspect-ratio sizing
    const renderFrame = (index: number) => {
      const img = images[index];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const width = canvas.width;
      const height = canvas.height;

      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = width / height;

      let renderWidth = width;
      let renderHeight = height;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasRatio > imgRatio) {
        renderHeight = width / imgRatio;
        offsetY = (height - renderHeight) / 2;
      } else {
        renderWidth = height * imgRatio;
        offsetX = (width - renderWidth) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
    };

    // Resize canvas to display size
    const resizeCanvas = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      renderFrame(currentFrameIndex);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Preload frames in memory
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameSrc(i);
      img.onload = () => {
        if (i === 0) {
          renderFrame(0);
          ScrollTrigger.refresh();
        }
      };
      images.push(img);
    }

    // GSAP ScrollTrigger timeline tracking container scroll progress
    const scrollTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.3,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const targetIndex = Math.min(
            TOTAL_FRAMES - 1,
            Math.max(0, Math.floor(self.progress * (TOTAL_FRAMES - 1)))
          );
          if (targetIndex !== currentFrameIndex) {
            currentFrameIndex = targetIndex;
            renderFrame(currentFrameIndex);
          }
        },
      },
    });

    // Synchronize text overlays with scroll scrub
    scrollTimeline
      // Phase 1: Headline text (0% to 35%)
      .fromTo(
        phase1Ref.current,
        { opacity: 0, y: 30, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power1.out' }
      )
      .to(
        phase1Ref.current,
        { opacity: 0, y: -30, duration: 0.6, ease: 'power1.in' },
        '+=0.5'
      )

      // Phase 2: Editorial story & CTA reveal (45% to 100%)
      .fromTo(
        phase2Ref.current,
        { opacity: 0, y: 40, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power1.out' }
      );

    return () => {
      scrollTimeline.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <section ref={containerRef} className="relative w-full h-[250vh] bg-bg-deep">
      {/* Sticky Hero Viewport (stays fixed during the 250vh scroll, then naturally scrolls up) */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-bg-deep">
        {/* HTML5 Canvas Frame-by-Frame Scrub Surface */}
        <div className="absolute inset-0 z-0">
          <canvas
            ref={canvasRef}
            className="h-full w-full object-cover brightness-[0.7] contrast-[1.05]"
          />

          {/* Ambient Dark Gradient Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-bg-primary/30 pointer-events-none" />
        </div>

        {/* Editorial Text Overlays */}
        <div className="relative z-10 flex h-full items-center justify-center px-6 text-center">
          {isReducedMotion ? (
            /* Accessible Static Layout for Reduced Motion */
            <div className="max-w-3xl space-y-6">
              <span className="text-xs uppercase tracking-[0.35em] text-accent-brass font-medium">
                {brandConfig.name} — {brandConfig.tagline}
              </span>
              <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light text-text-ondark leading-[1.05] tracking-tight">
                {content.home.hero.headline}
              </h1>
              <p className="text-sm md:text-base text-text-ondark/80 font-light leading-relaxed tracking-wide max-w-xl mx-auto">
                {content.home.hero.subheadline}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 pt-2">
                <Link
                  href="/shop"
                  className="w-full max-w-[270px] sm:w-auto bg-accent-brass px-7 py-3 text-xs uppercase tracking-[0.25em] font-medium text-bg-primary hover:bg-accent-brass-hover transition-colors flex items-center justify-center gap-3 rounded-md shadow-md"
                >
                  {content.home.hero.cta}
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/story"
                  className="w-full max-w-[270px] sm:w-auto border border-hairline bg-bg-primary/80 backdrop-blur-md px-7 py-3 text-xs uppercase tracking-[0.25em] font-medium text-text-ondark hover:border-accent-brass transition-colors flex items-center justify-center rounded-md"
                >
                  {content.home.editorial.cta}
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Phase 1 Overlay */}
              <div
                ref={phase1Ref}
                className="absolute max-w-4xl space-y-6 pointer-events-none"
              >
                <span className="text-xs uppercase tracking-[0.35em] text-accent-brass font-medium">
                  {brandConfig.name} — {brandConfig.tagline}
                </span>
                <h1 className="font-serif text-5xl md:text-7xl lg:text-9xl font-light text-text-ondark leading-[1.02] tracking-tight">
                  {content.home.hero.headline}
                </h1>
              </div>

              {/* Phase 2 Overlay */}
              <div
                ref={phase2Ref}
                className="absolute max-w-2xl space-y-8 pointer-events-auto"
              >
                <span className="text-xs uppercase tracking-[0.3em] text-accent-brass font-medium">
                  The Atelier Collection
                </span>
                <h2 className="font-serif text-3xl md:text-5xl font-light text-text-ondark leading-tight">
                  {content.home.editorial.headline}
                </h2>
                <p className="text-sm md:text-base text-text-ondark/80 font-light leading-relaxed tracking-wide">
                  {content.home.hero.subheadline}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-5 pt-4">
                  <Link
                    href="/shop"
                    className="w-full max-w-[270px] sm:w-auto bg-accent-brass px-7 py-3.5 sm:px-9 sm:py-4 text-xs uppercase tracking-[0.25em] font-medium text-bg-primary hover:bg-accent-brass-hover transition-colors flex items-center justify-center gap-3 rounded-md shadow-md"
                  >
                    {content.home.hero.cta}
                    <ArrowRight size={14} />
                  </Link>
                  <Link
                    href="/story"
                    className="w-full max-w-[270px] sm:w-auto border border-hairline bg-bg-primary/80 backdrop-blur-md px-7 py-3.5 sm:px-9 sm:py-4 text-xs uppercase tracking-[0.25em] font-medium text-text-ondark hover:border-accent-brass transition-colors flex items-center justify-center rounded-md"
                  >
                    {content.home.editorial.cta}
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
