'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { brandConfig } from '@/config/brand.config';

interface BrandIntroSplashProps {
  onComplete?: () => void;
}

export function BrandIntroSplash({ onComplete }: BrandIntroSplashProps) {
  const [phase, setPhase] = useState<'enter' | 'smoke' | 'done'>('enter');

  useEffect(() => {
    // 1. Show word-by-word reveal in 'enter' phase
    // 2. Transition to 'smoke' dissolve phase after 1.8s
    const smokeTimer = setTimeout(() => {
      setPhase('smoke');
    }, 2000);

    // 3. Complete and unmount splash curtain after smoke finishes (2.9s)
    const finishTimer = setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 2900);

    return () => {
      clearTimeout(smokeTimer);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setPhase('smoke');
    setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 400);
  };

  const brandWords = [brandConfig.name, '—', brandConfig.tagline];
  const subWords = ['Craft', 'that', 'refuses', 'to', 'compromise.'];

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          key="brand-intro-splash"
          initial={{ opacity: 1 }}
          animate={phase === 'smoke' ? { opacity: 0 } : { opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          onClick={handleSkip}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070605] text-text-ondark overflow-hidden select-none cursor-pointer"
        >
          {/* Subtle Ambient Radial Golden Aura in the Background */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={
              phase === 'smoke'
                ? { opacity: 0, scale: 1.8, filter: 'blur(60px)' }
                : { opacity: 0.85, scale: 1.1, filter: 'blur(40px)' }
            }
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="absolute h-[500px] w-[500px] sm:h-[700px] sm:w-[700px] rounded-full bg-radial from-accent-brass/25 via-accent-brass/5 to-transparent pointer-events-none"
          />

          {/* Ethereal Smoke Particle Clouds / Mist Rings */}
          {phase === 'smoke' && (
            <>
              <motion.div
                initial={{ opacity: 0.7, scale: 0.9, y: 0, filter: 'blur(20px)' }}
                animate={{ opacity: 0, scale: 2.2, y: -90, filter: 'blur(60px)' }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="absolute w-[600px] h-[300px] rounded-full bg-gradient-to-t from-accent-brass/30 via-white/10 to-transparent pointer-events-none"
              />
              <motion.div
                initial={{ opacity: 0.6, scale: 0.8, x: -40, y: 0, filter: 'blur(15px)' }}
                animate={{ opacity: 0, scale: 2.4, x: -80, y: -120, filter: 'blur(50px)' }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
                className="absolute w-[450px] h-[250px] rounded-full bg-gradient-to-br from-accent-brass/20 via-white/5 to-transparent pointer-events-none"
              />
              <motion.div
                initial={{ opacity: 0.6, scale: 0.8, x: 40, y: 0, filter: 'blur(15px)' }}
                animate={{ opacity: 0, scale: 2.4, x: 80, y: -120, filter: 'blur(50px)' }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
                className="absolute w-[450px] h-[250px] rounded-full bg-gradient-to-bl from-accent-brass/20 via-white/5 to-transparent pointer-events-none"
              />
            </>
          )}

          {/* Center Brand Text Container */}
          <div className="relative z-10 max-w-4xl px-6 text-center space-y-6">
            {/* Top Monogram Crest */}
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.85 }}
              animate={
                phase === 'smoke'
                  ? { opacity: 0, y: -35, scale: 1.2, filter: 'blur(24px)' }
                  : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
              }
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-accent-brass/40 bg-accent-brass/10 text-accent-brass shadow-lg shadow-accent-brass/10"
            >
              <Sparkles size={22} className="text-accent-brass animate-pulse" />
            </motion.div>

            {/* Word-by-Word Brand Title */}
            <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-1">
              {brandWords.map((word, index) => (
                <motion.span
                  key={`brand-${index}`}
                  initial={{ opacity: 0, y: 25, filter: 'blur(12px)' }}
                  animate={
                    phase === 'smoke'
                      ? {
                          opacity: 0,
                          y: -50 - index * 10,
                          scale: 1.15,
                          filter: 'blur(30px)',
                          transition: {
                            duration: 0.8,
                            delay: index * 0.04,
                            ease: 'easeOut',
                          },
                        }
                      : {
                          opacity: 1,
                          y: 0,
                          filter: 'blur(0px)',
                          transition: {
                            duration: 0.8,
                            delay: 0.2 + index * 0.18,
                            ease: [0.16, 1, 0.3, 1],
                          },
                        }
                  }
                  className="font-serif text-3xl sm:text-5xl md:text-7xl font-light tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5E6] via-[#E8D3B9] to-[#C6A87D]"
                >
                  {word}
                </motion.span>
              ))}
            </div>

            {/* Sub-Tagline Word-by-Word Reveal & Smoke Dissolve */}
            <div className="flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-2.5 gap-y-1 pt-2">
              {subWords.map((word, index) => (
                <motion.span
                  key={`sub-${index}`}
                  initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                  animate={
                    phase === 'smoke'
                      ? {
                          opacity: 0,
                          y: -35 - index * 8,
                          scale: 1.1,
                          filter: 'blur(24px)',
                          transition: {
                            duration: 0.75,
                            delay: index * 0.03,
                            ease: 'easeOut',
                          },
                        }
                      : {
                          opacity: 0.85,
                          y: 0,
                          filter: 'blur(0px)',
                          transition: {
                            duration: 0.7,
                            delay: 0.75 + index * 0.12,
                            ease: [0.16, 1, 0.3, 1],
                          },
                        }
                  }
                  className="text-xs sm:text-sm md:text-base uppercase tracking-[0.3em] text-accent-brass/90 font-light"
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Subtle click-to-skip prompt */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={phase === 'smoke' ? { opacity: 0 } : { opacity: 0.4 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="absolute bottom-8 text-[10px] uppercase tracking-[0.25em] text-text-ondark/40"
          >
            Click anywhere to enter
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
