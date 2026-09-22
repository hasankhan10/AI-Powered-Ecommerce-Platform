'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { brandConfig } from '@/config/brand.config';

interface BrandIntroSplashProps {
  onComplete?: () => void;
}

// Global start timestamp to ensure seamless continuity across Next.js loading/hydration boundaries
let globalIntroStartTime: number | null = null;
let globalIntroDone = false;

export function BrandIntroSplash({ onComplete }: BrandIntroSplashProps) {
  const [phase, setPhase] = useState<'enter' | 'smoke' | 'done'>('enter');

  useEffect(() => {
    if (globalIntroDone) {
      setPhase('done');
      return;
    }

    if (!globalIntroStartTime) {
      globalIntroStartTime = Date.now();
    }

    const elapsed = Date.now() - globalIntroStartTime;
    const remainingToSmoke = Math.max(0, 5000 - elapsed);
    const remainingToFinish = Math.max(0, 6600 - elapsed);

    // 1. Transition into smooth smoke dissolution at 5.0s
    const smokeTimer = setTimeout(() => {
      setPhase('smoke');
    }, remainingToSmoke);

    // 2. Complete and unmount splash curtain after smoke finishes (6.6s total)
    const finishTimer = setTimeout(() => {
      setPhase('done');
      globalIntroDone = true;
      if (onComplete) onComplete();
    }, remainingToFinish);

    return () => {
      clearTimeout(smokeTimer);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setPhase('smoke');
    setTimeout(() => {
      setPhase('done');
      globalIntroDone = true;
      if (onComplete) onComplete();
    }, 500);
  };

  const brandWords = [brandConfig.name, '—', brandConfig.tagline];
  const subWords = ['Craft', 'that', 'refuses', 'to', 'compromise.'];

  if (globalIntroDone) return null;

  return (
    <AnimatePresence mode="wait">
      {phase !== 'done' && (
        <motion.div
          key="brand-intro-splash"
          initial={{ opacity: 1 }}
          animate={phase === 'smoke' ? { opacity: 0 } : { opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={handleSkip}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070605] text-text-ondark overflow-hidden select-none cursor-pointer transform-gpu"
          style={{ willChange: 'opacity' }}
        >
          {/* Hardware-Accelerated Ambient Warm Golden Aura */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={
              phase === 'smoke'
                ? { opacity: 0, scale: 1.8, y: -60 }
                : { opacity: 0.75, scale: 1, y: 0 }
            }
            transition={{ duration: phase === 'smoke' ? 1.4 : 1.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute h-[380px] w-[380px] sm:h-[650px] sm:w-[650px] rounded-full pointer-events-none transform-gpu"
            style={{
              background: 'radial-gradient(circle, rgba(198,168,125,0.22) 0%, rgba(198,168,125,0.06) 45%, transparent 70%)',
              willChange: 'transform, opacity',
            }}
          />

          {/* Ethereal Golden Mist Dissolution Clouds (GPU-accelerated radial layers) */}
          {phase === 'smoke' && (
            <>
              <motion.div
                initial={{ opacity: 0.6, scale: 0.9, y: 0 }}
                animate={{ opacity: 0, scale: 2.2, y: -100 }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                className="absolute w-[320px] sm:w-[600px] h-[220px] sm:h-[320px] rounded-full pointer-events-none transform-gpu"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(198,168,125,0.25) 0%, rgba(255,255,255,0.08) 40%, transparent 70%)',
                  willChange: 'transform, opacity',
                }}
              />
              <motion.div
                initial={{ opacity: 0.5, scale: 0.85, x: -30, y: 0 }}
                animate={{ opacity: 0, scale: 2.3, x: -80, y: -120 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute w-[260px] sm:w-[480px] h-[180px] sm:h-[260px] rounded-full pointer-events-none transform-gpu"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(219,185,140,0.18) 0%, transparent 65%)',
                  willChange: 'transform, opacity',
                }}
              />
              <motion.div
                initial={{ opacity: 0.5, scale: 0.85, x: 30, y: 0 }}
                animate={{ opacity: 0, scale: 2.3, x: 80, y: -120 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute w-[260px] sm:w-[480px] h-[180px] sm:h-[260px] rounded-full pointer-events-none transform-gpu"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(219,185,140,0.18) 0%, transparent 65%)',
                  willChange: 'transform, opacity',
                }}
              />
            </>
          )}

          {/* Center Brand Text Container */}
          <div className="relative z-10 max-w-4xl px-4 sm:px-6 text-center space-y-5 sm:space-y-7">
            {/* Top Monogram Crest */}
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.85 }}
              animate={
                phase === 'smoke'
                  ? { opacity: 0, y: -35, scale: 1.2 }
                  : { opacity: 1, y: 0, scale: 1 }
              }
              transition={{
                duration: phase === 'smoke' ? 1.0 : 1.2,
                delay: phase === 'smoke' ? 0 : 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mx-auto flex h-12 w-12 sm:h-15 sm:w-15 items-center justify-center rounded-full border border-accent-brass/50 bg-accent-brass/10 text-accent-brass shadow-lg shadow-accent-brass/20 transform-gpu"
              style={{ willChange: 'transform, opacity' }}
            >
              <Sparkles size={20} className="text-accent-brass" />
            </motion.div>

            {/* Word-by-Word Brand Title (Mobile-responsive & Smooth 60fps) */}
            <div className="flex flex-wrap items-center justify-center gap-x-2.5 sm:gap-x-4 gap-y-1 sm:gap-y-2">
              {brandWords.map((word, index) => (
                <motion.span
                  key={`brand-${index}`}
                  initial={{ opacity: 0, y: 25, scale: 0.96 }}
                  animate={
                    phase === 'smoke'
                      ? {
                          opacity: 0,
                          y: -40 - index * 8,
                          scale: 1.12,
                          transition: {
                            duration: 1.1,
                            delay: index * 0.04,
                            ease: [0.16, 1, 0.3, 1],
                          },
                        }
                      : {
                          opacity: 1,
                          y: 0,
                          scale: 1,
                          transition: {
                            duration: 1.1,
                            delay: 0.4 + index * 0.35,
                            ease: [0.16, 1, 0.3, 1],
                          },
                        }
                  }
                  className="font-serif text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#FFF8EE] via-[#EADBCA] to-[#C6A87D] drop-shadow-sm inline-block transform-gpu"
                  style={{ willChange: 'transform, opacity' }}
                >
                  {word}
                </motion.span>
              ))}
            </div>

            {/* Sub-Tagline Word-by-Word Reveal & Smoke Dissolve */}
            <div className="flex flex-wrap items-center justify-center gap-x-1.5 sm:gap-x-2.5 gap-y-1 pt-0.5 sm:pt-1">
              {subWords.map((word, index) => (
                <motion.span
                  key={`sub-${index}`}
                  initial={{ opacity: 0, y: 18 }}
                  animate={
                    phase === 'smoke'
                      ? {
                          opacity: 0,
                          y: -28 - index * 6,
                          scale: 1.08,
                          transition: {
                            duration: 1.0,
                            delay: index * 0.03,
                            ease: [0.16, 1, 0.3, 1],
                          },
                        }
                      : {
                          opacity: 0.9,
                          y: 0,
                          scale: 1,
                          transition: {
                            duration: 0.95,
                            delay: 1.8 + index * 0.22,
                            ease: [0.16, 1, 0.3, 1],
                          },
                        }
                  }
                  className="text-[11px] sm:text-xs md:text-sm uppercase tracking-[0.25em] sm:tracking-[0.35em] text-accent-brass/90 font-light inline-block transform-gpu"
                  style={{ willChange: 'transform, opacity' }}
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Subtle click/tap prompt */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={phase === 'smoke' ? { opacity: 0 } : { opacity: 0.35 }}
            transition={{ delay: 2.2, duration: 0.8 }}
            className="absolute bottom-6 sm:bottom-10 text-[9px] sm:text-[10px] uppercase tracking-[0.25em] sm:tracking-[0.3em] text-text-ondark/50 font-light"
          >
            Tap anywhere to enter
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
