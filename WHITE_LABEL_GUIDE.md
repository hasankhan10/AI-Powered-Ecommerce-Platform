# 🎨 White-Label Rebranding & Deployment Manual

This guide walks you through rebranding the **AI-Powered E-Commerce Framework** for a new brand, client, or e-commerce storefront in minutes.

---

## ⚡ 5-Step White-Label Checklist

### Step 1: Brand Configuration
Navigate to `config/brand.config.ts`. This single configuration file controls brand identity, metadata, currency, and contacts across all pages:

```typescript
export const brandConfig = {
  name: "Your Brand Name",
  tagline: "Your Brand Tagline",
  description: "Your official brand description for SEO and social sharing.",
  logo: {
    src: "/logo.svg",       // Place your SVG/PNG logo in /public/logo.svg
    alt: "Brand Name",
    width: 140,
    height: 32,
  },
  contact: {
    email: "concierge@yourbrand.com",
    phone: "+1 800 555 0100",
    address: "Your Corporate Address",
  },
  currency: {
    code: "USD",           // 'USD', 'EUR', 'GBP', 'INR', 'AED', etc.
    symbol: "$",
    locale: "en-US",
  },
  social: {
    instagram: "https://instagram.com/yourbrand",
    twitter: "https://twitter.com/yourbrand",
    pinterest: "https://pinterest.com/yourbrand",
  },
} as const;
```

---

### Step 2: Theme & Color Palette
Open `app/globals.css`. Adjust the root CSS design tokens to match the client's brand guidelines:

```css
:root {
  /* Surface and Backgrounds */
  --color-bg-primary: #0a0a0a;   /* Primary dark canvas */
  --color-bg-deep: #111111;      /* Card and module background */
  --color-surface-light: #f9f9fb; /* Light modal or invoice background */

  /* Brand Accents */
  --color-accent-brass: #c5a880; /* Primary luxury accent (e.g. Gold, Brass, Copper) */
  --color-accent-wine: #5c1d2e;  /* Secondary accent */

  /* Text and Borders */
  --color-text-onDark: #f5f5f7;  /* High contrast text */
  --color-text-onLight: #111111; /* Inverted text */
  --color-hairline: rgba(255, 255, 255, 0.08); /* Luxury subtle border */
}
```

---

### Step 3: Typography (Optional)
To use custom Google Fonts or Adobe Typekit:
1. Open `app/layout.tsx`.
2. Import your chosen font family using `next/font/google`.
3. Update `config/brand.config.ts` font aliases (`fonts.display`, `fonts.body`).

---

### Step 4: Hero Assets & Media
1. Replace `/public/logo.svg` with the client's vector logo.
2. Replace `/public/hero.mp4` or hero poster image with brand-specific editorial footage.
3. Update `/public/og-default.jpg` for OpenGraph and social preview cards.

---

### Step 5: Database & AI Setup
1. Point `DATABASE_URL` in `.env.local` to the client's PostgreSQL database.
2. Add the client's Google Gemini API key to `GEMINI_API_KEY`.
3. Run `npm run db:migrate` and populate the catalog via `npm run db:seed` or directly in the `/admin/products` dashboard.

---

## 🚀 That's It!
Your customized white-label luxury store is ready to deploy to Vercel, AWS, or any containerized hosting platform.
