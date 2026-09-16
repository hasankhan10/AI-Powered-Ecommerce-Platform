# ✦ Luxury AI E-Commerce Framework (White-Label)

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15.x-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.x-20232A?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-8.x-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI_Engine-8E75FF?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-gold?style=for-the-badge)](LICENSE)

<p align="center">
  <strong>An enterprise-grade, production-ready White-Label E-Commerce Framework powered by Autonomous AI Engines, modern React 19 architecture, and an editorial dark-luxury design language.</strong>
</p>

[Quickstart](#-quickstart) • [White-Label Customization](#-white-label-rebranding-guide) • [AI Copilot Engine](#-ai-copilot-suite) • [Architecture](#-framework-architecture) • [Admin OS](#-admin-operating-system)

</div>

---

## 🏛️ Framework Overview

This repository is an **all-in-one white-label framework** engineered for high-growth brands, digital agencies, and luxury retailers. Instead of gluing together disjointed plugins, this framework provides a unified codebase containing:

1. **Editorial Luxury Storefront**: Built on Next.js 15 App Router, React 19, Smooth Lenis scrolling, Framer Motion, skeleton previews, and obsidian glassmorphism UI.
2. **AI Copilot Suite**: Integrated Google Gemini AI for autonomous product description generation, real-time SEO meta tag generation, and automated concierge client ticketing.
3. **Full Admin Operating System**: Realtime analytics, order fulfillment state machine, multi-variant inventory management, dynamic coupon engines, and store settings.
4. **Logistics & Invoicing Engine**: Native Shiprocket logistics connector + automated branded PDF Tax Invoice and Shipping Label generators.
5. **Zero-Hardcoding White-Label Architecture**: Change brand identity, typography, color palette, currency, social links, and legal policies across the entire application from a single config file (`config/brand.config.ts`).

---

## 🎨 White-Label Rebranding Guide

You can completely rebrand the platform for any client or store in **under 5 minutes**.

### 1. Brand Identity Configuration
Edit [`config/brand.config.ts`](config/brand.config.ts) to define your brand parameters:

```typescript
export const brandConfig = {
  name: "Maison Vale",
  tagline: "Quietly Luxurious",
  description: "Crafted apparel, accessories, and home objects for deliberate living.",
  logo: {
    src: "/logo.svg",
    alt: "Maison Vale",
    width: 140,
    height: 32,
  },
  contact: {
    email: "concierge@yourbrand.com",
    phone: "+1 (800) 555-0199",
    address: "740 Madison Avenue, New York, NY",
  },
  currency: {
    code: "USD",
    symbol: "$",
    locale: "en-US",
  },
  seo: {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://yourbrand.com",
    defaultTitle: "Your Brand — Modern Luxury",
    defaultDescription: "Curated collections crafted with intention.",
  },
  colors: {
    bgPrimary: "var(--color-bg-primary)",
    bgDeep: "var(--color-bg-deep)",
    accentBrass: "var(--color-accent-brass)",
    textOnDark: "var(--color-text-onDark)",
  },
  fonts: {
    display: "Fraunces",
    body: "Switzer",
  },
} as const;
```

### 2. Design Tokens & Color Palette
Custom design tokens live in [`app/globals.css`](app/globals.css). Simply update the CSS variables to transform the aesthetic:

```css
:root {
  --color-bg-primary: #0a0a0a;   /* Obsidian Canvas */
  --color-bg-deep: #111111;      /* Glass Surface */
  --color-accent-brass: #c5a880; /* Warm Metallic Gold/Brass */
  --color-text-onDark: #f5f5f7;  /* High Contrast Off-White */
  --color-hairline: rgba(255, 255, 255, 0.08);
}
```

---

## 🧠 AI Copilot Suite

The framework ships with native AI integrations powered by **Google Gemini AI SDK**:

| AI Engine | Function | Location |
| :--- | :--- | :--- |
| **Product Copywriter** | Generates editorial product descriptions tailored by tone (Minimal, Storyteller, High Luxury, Technical). | `lib/ai/copywriter.ts` |
| **SEO Meta Generator** | Analyzes product titles, categories, and attributes to synthesize search-optimized `metaTitle`, `metaDescription`, and high-intent keyword tags. | `lib/ai/seo.ts` |
| **Concierge Support Assistant** | AI first-responder for incoming customer inquiries with human operator escalation and instant response tools. | `lib/ai/support.ts` |

---

## ⚡ Framework Architecture

```
ai-ecom-framework/
├── app/                          # Next.js 15 App Router
│   ├── (storefront)/             # Public Customer Storefront (PDP, Catalog, Cart)
│   │   ├── collections/          # Filterable Collection Browsers
│   │   ├── product/[slug]/       # High-Converting Editorial Product Pages
│   │   ├── checkout/             # Multi-step High-Performance Checkout
│   │   └── order-confirm/        # Order Receipt & Tracking Screen
│   ├── admin/                    # Merchant Admin Command Center
│   │   ├── analytics/            # Revenue, Conversion & AOV Metrics
│   │   ├── products/             # Catalog CRUD + AI SEO Auto-generation
│   │   ├── orders/               # Fulfillment Pipeline & Invoice Trigger
│   │   ├── inventory/            # Real-time Stock Monitor & Restock Triggers
│   │   ├── content/              # AI Writing Partner & Studio
│   │   ├── support/              # Customer Concierge Ticket Desk
│   │   └── settings/             # Free Shipping Thresholds & Store Settings
│   └── api/                      # REST Endpoints (Orders, Products, AI, Shiprocket)
├── components/                   # Modular Reusable UI Architecture
│   ├── admin/                    # Merchant Management UI & Modals
│   ├── checkout/                 # Payment & Shipping Modules
│   ├── ui/                       # Design System (Skeleton loaders, Luxury Toasts)
│   └── storefront/               # Navbars, Footer, Hero Video, Product Cards
├── config/                       # Central White-Label Brand Configurations
│   └── brand.config.ts           # 🌟 100% Brand Customization in One File
├── lib/                          # Backend Services & Helpers
│   ├── ai/                       # Gemini AI SDK & Prompt Chains
│   ├── db/                       # Prisma 8 Database Access Layer & Queries
│   ├── invoices/                 # Branded PDF Invoice & Label Generator
│   ├── shiprocket/               # Automated Logistics Connector
│   └── store/                    # Zustand State (Cart, Toast, Drawer)
├── prisma/                       # Prisma 8 Schema & Seed Engine
└── public/                       # Static Assets (Logos, Video, Fallback Images)
```

---

## 🚀 Quickstart

### Prerequisites
- Node.js 20+
- PostgreSQL database (Supabase, Neon, AWS RDS, or local Postgres)
- Google Gemini API Key

### 1. Clone & Install
```bash
git clone https://github.com/your-org/ai-ecom-framework.git
cd ai-ecom-framework
npm install
```

### 2. Configure Environment Variables
Copy the `.env.example` template:
```bash
cp .env.example .env.local
```
Fill in your database URL, Gemini API Key, and Supabase credentials in `.env.local`.

### 3. Initialize & Seed Database
```bash
# Push database migrations with Prisma
npm run db:migrate

# Seed with luxury demo catalog & sample orders
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront, or [http://localhost:3000/admin/products](http://localhost:3000/admin/products) for the Merchant Command Center.

---

## 🛡️ Admin Operating System

- **Product Management**: Full CRUD with multi-variant stock, image drag-and-drop, inline category management, and one-click AI SEO synthesis.
- **Order Pipeline**: Full state machine (Pending $\to$ Processing $\to$ Shipped $\to$ Delivered $\to$ Cancelled) with realtime status updates and toast confirmations.
- **Logistics & Invoicing**: Automated creation of GST/Tax invoices and carrier shipping labels.
- **Inventory Control**: Realtime stock tracking with low-stock warning indicators and inline restock controls.
- **Dynamic Settings**: Merchant-controlled minimum order value for free delivery with live storefront calculation.

---

## 🔔 Luxury Feedback & Toast System

The framework includes a built-in obsidian glassmorphic Toast notification system:
```typescript
import { toast } from '@/lib/store/useToast';

// Trigger anywhere across your client components
toast.success('Product catalog updated successfully.', 'Catalog');
toast.error('Payment authorization failed.', 'Checkout');
toast.warning('Low inventory remaining.', 'Inventory');
toast.info('Item added to shopping bag.', {
  action: { label: 'View Bag', onClick: () => openCartDrawer() }
});
```

---

## 📦 Deployment

### Deploy to Vercel
1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Add the environment variables from your `.env.local`.
4. Deploy!

---

## 📄 License

This framework is open-source software licensed under the **[MIT License](LICENSE)**. You are free to use it for personal, agency, and commercial white-label client deployments.
