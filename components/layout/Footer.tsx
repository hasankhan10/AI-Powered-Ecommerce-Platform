'use client';

import React from 'react';
import Link from 'next/link';
import { Compass } from 'lucide-react';
import { brandConfig } from '@/config/brand.config';
import { content } from '@/config/content';

export function Footer() {
  return (
    <footer className="w-full border-t border-hairline bg-bg-deep text-text-ondark pt-10 pb-6">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Main Navigation & Brand columns */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 pb-8 md:grid-cols-12 border-b border-hairline">
          {/* Brand Identity (Full width on mobile 2-col, 4 cols on desktop) */}
          <div className="col-span-2 md:col-span-4 space-y-2.5">
            <h3 className="font-serif text-xl tracking-[0.12em] text-text-ondark">
              {brandConfig.name.toUpperCase()}
            </h3>
            <p className="text-[10px] tracking-widest uppercase text-accent-brass font-medium">
              {content.footer.tagline}
            </p>
            <p className="text-xs leading-relaxed text-text-ondark/60 max-w-sm font-light">
              {brandConfig.description}
            </p>
          </div>

          {/* Shop Column (1 col on mobile, 2 cols on desktop) */}
          <div className="col-span-1 md:col-span-2 space-y-2.5">
            <h5 className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium">
              {content.footer.columnsHeadings.shop}
            </h5>
            <ul className="space-y-2 text-xs text-text-ondark/70 font-light">
              {content.footer.shop.map((item) => (
                <li key={item}>
                  <Link href="/shop" className="hover:text-accent-brass transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column (1 col on mobile, 2 cols on desktop) */}
          <div className="col-span-1 md:col-span-2 space-y-2.5">
            <h5 className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium">
              {content.footer.columnsHeadings.company}
            </h5>
            <ul className="space-y-2 text-xs text-text-ondark/70 font-light">
              {content.footer.company.map((item) => (
                <li key={item}>
                  <Link href="/story" className="hover:text-accent-brass transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column (1 col on mobile, 2 cols on desktop) */}
          <div className="col-span-1 md:col-span-2 space-y-2.5">
            <h5 className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium">
              {content.footer.columnsHeadings.support}
            </h5>
            <ul className="space-y-2 text-xs text-text-ondark/70 font-light">
              {content.footer.support.map((item) => (
                <li key={item}>
                  <Link href="/support" className="hover:text-accent-brass transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Socials (1 col on mobile, 2 cols on desktop) */}
          <div className="col-span-1 md:col-span-2 space-y-2.5">
            <h5 className="text-[10px] uppercase tracking-[0.25em] text-accent-brass font-medium">
              Atelier
            </h5>
            <p className="text-xs text-text-ondark/60 leading-relaxed font-light">
              {brandConfig.contact.address}
            </p>
            <div className="flex items-center space-x-3 pt-1">
              <a
                href={brandConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-ondark/60 hover:text-accent-brass transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href={brandConfig.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-ondark/60 hover:text-accent-brass transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href={brandConfig.social.pinterest}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-ondark/60 hover:text-accent-brass transition-colors"
                aria-label="Pinterest"
              >
                <Compass size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Credit bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-5 text-[11px] text-text-ondark/40 font-light space-y-2 sm:space-y-0">
          <p>{content.footer.legal}</p>
          <p>
            Design and Developed by{' '}
            <a
              href={content.footer.developerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-ondark/70 hover:text-accent-brass transition-colors underline decoration-accent-brass/40 underline-offset-4"
            >
              Stova Media
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
