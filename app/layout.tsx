import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";
import { brandConfig } from "@/config/brand.config";
import { LenisProvider } from "@/components/providers/LenisProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AssistantChatDrawer } from "@/components/assistant/AssistantChatDrawer";
import { AssistantFloatingTrigger } from "@/components/assistant/AssistantFloatingTrigger";
import { SearchModal } from "@/components/search/SearchModal";

import { ToastContainer } from "@/components/ui/Toast";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(brandConfig.seo.siteUrl),
  title: {
    default: brandConfig.seo.defaultTitle,
    template: `%s — ${brandConfig.name}`,
  },
  description: brandConfig.seo.defaultDescription,
  openGraph: {
    title: brandConfig.seo.defaultTitle,
    description: brandConfig.seo.defaultDescription,
    siteName: brandConfig.name,
    images: [{ url: brandConfig.seo.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: brandConfig.seo.defaultTitle,
    description: brandConfig.seo.defaultDescription,
    creator: brandConfig.seo.twitterHandle,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-primary text-text-ondark font-sans selection:bg-accent-brass selection:text-bg-primary">
        <LenisProvider>
          {children}
          <CartDrawer />
          <AssistantChatDrawer />
          <AssistantFloatingTrigger />
          <SearchModal />
          <ToastContainer />
        </LenisProvider>
      </body>
    </html>
  );
}


