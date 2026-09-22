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
    // 1. Slow, majestic word-by-word reveal (0s - 4.4s)
    // 2. Transition into slow ethereal smoke dissolution at 4.4s
    const smokeTimer = setTimeout(() => {
      setPhase('smoke');
    }, 4400);

    // 3. Complete and unmount splash curtain after smoke finishes (6.0s total)
    const finishTimer = setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 6000);

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
    }, 600);
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
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          onClick={handleSkip}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070605] text-text-ondark overflow-hidden select-none cursor-pointer"
        >
          {/* Ambient Warm Golden Aura in Background */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={
              phase === 'smoke'
                ? { opacity: 0, scale: 2.2, filter: 'blur(80px)' }
                : { opacity: 0.9, scale: 1.15, filter: 'blur(50px)' }
            }
            transition={{ duration: phase === 'smoke' ? 1.6 : 2.2, ease: 'easeOut' }}
            className="absolute h-[550px] w-[550px] sm:h-[800px] sm:w-[800px] rounded-full bg-radial from-accent-brass/25 via-accent-brass/5 to-transparent pointer-events-none"
          />

          {/* Ethereal Smoke Clouds / Dissolving Mist */}
          {phase === 'smoke' && (
            <>
              <motion.div
                initial={{ opacity: 0.8, scale: 0.9, y: 0, filter: 'blur(20px)' }}
                animate={{ opacity: 0, scale: 2.6, y: -120, filter: 'blur(70px)' }}
                transition={{ duration: 1.6, ease: [0.25, 1, 0.5, 1] }}
                className="absolute w-[700px] h-[350px] rounded-full bg-gradient-to-t from-accent-brass/35 via-white/10 to-transparent pointer-events-none"
              />
              <motion.div
                initial={{ opacity: 0.7, scale: 0.8, x: -50, y: 0, filter: 'blur(18px)' }}
                animate={{ opacity: 0, scale: 2.8, x: -120, y: -150, filter: 'blur(60px)' }}
                transition={{ duration: 1.7, ease: [0.25, 1, 0.5, 1] }}
                className="absolute w-[500px] h-[300px] rounded-full bg-gradient-to-br from-accent-brass/25 via-white/10 to-transparent pointer-events-none"
              />
              <motion.div
                initial={{ opacity: 0.7, scale: 0.8, x: 50, y: 0, filter: 'blur(18px)' }}
                animate={{ opacity: 0, scale: 2.8, x: 120, y: -150, filter: 'blur(60px)' }}
                transition={{ duration: 1.7, ease: [0.25, 1, 0.5, 1] }}
                className="absolute w-[500px] h-[300px] rounded-full bg-gradient-to-bl from-accent-brass/25 via-white/10 to-transparent pointer-events-none"
              />
            </>
          )}

          {/* Center Brand Text Container */}
          <div className="relative z-10 max-w-4xl px-6 text-center space-y-8">
            {/* Top Monogram Crest */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={
                phase === 'smoke'
                  ? { opacity: 0, y: -45, scale: 1.25, filter: 'blur(30px)' }
                  : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
              }
              transition={{
                duration: phase === 'smoke' ? 1.2 : 1.4,
                delay: phase === 'smoke' ? 0 : 0.3,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-accent-brass/50 bg-accent-brass/10 text-accent-brass shadow-2xl shadow-accent-brass/20"
            >
              <Sparkles size={24} className="text-accent-brass animate-pulse" />
            </motion.div>

            {/* Word-by-Word Brand Title (Paced & Meditative) */}
            <div className="flex flex-wrap items-center justify-center gap-x-3.5 sm:gap-x-5 gap-y-2">
              {brandWords.map((word, index) => (
                <motion.span
                  key={`brand-${index}`}
                  initial={{ opacity: 0, y: 35, filter: 'blur(16px)' }}
                  animate={
                    phase === 'smoke'
                      ? {
                          opacity: 0,
                          y: -60 - index * 12,
                          scale: 1.2,
                          filter: 'blur(36px)',
                          transition: {
                            duration: 1.4,
                            delay: index * 0.06,
                            ease: 'easeInOut',
                          },
                        }
                      : {
                          opacity: 1,
                          y: 0,
                          filter: 'blur(0px)',
                          transition: {
                            duration: 1.4,
                            delay: 0.6 + index * 0.45,
                            ease: [0.16, 1, 0.3, 1],
                          },
                        }
                  }
                  className="font-serif text-3xl sm:text-5xl md:text-7xl font-light tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-[#FFF8EE] via-[#EADBCA] to-[#C6A87D] drop-shadow-md"
                >
                  {word}
                </motion.span>
              ))}
            </div>

            {/* Sub-Tagline Word-by-Word Reveal & Smoke Dissolve */}
            <div className="flex flex-wrap items-center justify-center gap-x-2.5 sm:gap-x-3 gap-y-1.5 pt-1">
              {subWords.map((word, index) => (
                <motion.span
                  key={`sub-${index}`}
                  initial={{ opacity: 0, y: 25, filter: 'blur(10px)' }}
                  animate={
                    phase === 'smoke'
                      ? {
                          opacity: 0,
                          y: -40 - index * 10,
                          scale: 1.15,
                          filter: 'blur(28px)',
                          transition: {
                            duration: 1.3,
                            delay: index * 0.05,
                            ease: 'easeInOut',
                          },
                        }
                      : {
                          opacity: 0.9,
                          y: 0,
                          filter: 'blur(0px)',
                          transition: {
                            duration: 1.2,
                            delay: 2.2 + index * 0.28,
                            ease: [0.16, 1, 0.3, 1],
                          },
                        }
                  }
                  className="text-xs sm:text-sm md:text-base uppercase tracking-[0.35em] text-accent-brass/90 font-light"
                >
                  {word}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Subtle click-to-skip prompt */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={phase === 'smoke' ? { opacity: 0 } : { opacity: 0.35 }}
            transition={{ delay: 2.5, duration: 1.0 }}
            className="absolute bottom-10 text-[10px] uppercase tracking-[0.3em] text-text-ondark/50 font-light"
          >
            Click anywhere to enter
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
