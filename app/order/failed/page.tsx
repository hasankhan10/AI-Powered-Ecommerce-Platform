import Link from 'next/link';
import { AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { brandConfig } from '@/config/brand.config';
import { content } from '@/config/content';

interface FailedPageProps {
  searchParams: Promise<{
    orderNumber?: string;
  }>;
}

export const metadata = {
  title: `Payment Issue — ${brandConfig.name}`,
  description: 'Your payment could not be processed.',
};

export default async function OrderFailedPage({ searchParams }: FailedPageProps) {
  const { orderNumber } = await searchParams;

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary text-text-ondark">
      <Navbar />
      <main className="flex-1 py-24 px-6 lg:px-12">
        <div className="mx-auto max-w-xl text-center space-y-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center border border-red-500/40 bg-red-950/20 text-red-400">
            <AlertTriangle size={32} />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.3em] text-red-400 font-medium">
              Transaction Incomplete
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-light text-text-ondark tracking-tight">
              {content.checkout.failureTitle}
            </h1>
            <p className="text-xs text-text-ondark/70 font-light max-w-md mx-auto leading-relaxed">
              {content.checkout.failureBody}
            </p>
          </div>

          {orderNumber && (
            <div className="border border-hairline bg-bg-deep p-4 text-xs font-mono text-text-ondark/60">
              Reference: {orderNumber}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/checkout"
              className="w-full sm:w-auto bg-accent-brass px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-medium text-bg-primary hover:bg-accent-brass-hover transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={14} /> Retry Payment
            </Link>
            <Link
              href="/support"
              className="w-full sm:w-auto border border-hairline bg-bg-deep px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-medium text-text-ondark hover:border-accent-brass transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
