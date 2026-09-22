'use client';

import React from 'react';
import { content } from '@/config/content';
import { Award, PackageCheck, Store, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { StaggerContainer, staggerItemVariants } from '@/components/ui/FadeInView';

const statIcons = [Award, PackageCheck, Store, ShieldCheck];

export function TrustBar() {
  const { stats } = content.home.trustBar;

  return (
    <section className="w-full bg-bg-deep border-y border-hairline py-12 md:py-16 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <StaggerContainer
          staggerDelay={0.1}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 divide-y md:divide-y-0 md:divide-x divide-hairline"
        >
          {stats.map((stat, idx) => {
            const Icon = statIcons[idx % statIcons.length];
            return (
              <motion.div
                key={stat.label}
                variants={staggerItemVariants}
                className={`flex flex-col items-center text-center p-4 group transition-all duration-300 ${
                  idx > 0 ? 'pt-6 md:pt-4 md:pl-6' : ''
                }`}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-accent-brass/10 text-accent-brass group-hover:bg-accent-brass/20 group-hover:scale-110 transition-all duration-300">
                  <Icon size={18} />
                </div>
                <span className="font-serif text-3xl md:text-4xl font-light text-text-ondark group-hover:text-accent-brass transition-colors tracking-tight">
                  {stat.value}
                </span>
                <span className="mt-1 text-xs uppercase tracking-[0.2em] text-accent-brass font-medium">
                  {stat.label}
                </span>
                <p className="mt-1 text-[11px] text-text-ondark/60 font-light max-w-[200px] leading-relaxed">
                  {stat.description}
                </p>
              </motion.div>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
