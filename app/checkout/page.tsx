import { Metadata } from 'next';
import { CheckoutClient } from '@/components/checkout/CheckoutClient';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { brandConfig } from '@/config/brand.config';

export const metadata: Metadata = {
  title: `Checkout — ${brandConfig.name}`,
  description: 'Secure checkout and payment for your Maison Vale order.',
};

export default function CheckoutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg-primary text-text-ondark">
      <Navbar />
      <main className="flex-1">
        <CheckoutClient />
      </main>
      <Footer />
    </div>
  );
}
