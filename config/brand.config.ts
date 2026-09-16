/**
 * Brand configuration — the ONLY place brand identity lives.
 * Never hardcode any of these values inside a component.
 * To onboard a new client: update this file and content.ts, then redeploy.
 */
export const brandConfig = {
  name: "Maison Vale",
  tagline: "Quietly Luxurious",
  description:
    "Maison Vale is a design-forward lifestyle brand offering premium apparel, accessories, and home objects — crafted for those who live deliberately.",
  logo: {
    src: "/logo.svg",
    alt: "Maison Vale",
    width: 140,
    height: 32,
  },
  contact: {
    email: "hello@maisonvale.in",
    phone: "+91 98765 43210",
    address: "12 Bhavani Street, Alwarpet, Chennai — 600 018, India",
  },
  social: {
    instagram: "https://instagram.com/maisonvale",
    twitter: "https://twitter.com/maisonvale",
    pinterest: "https://pinterest.com/maisonvale",
  },
  currency: {
    code: "INR",
    symbol: "₹",
    locale: "en-IN",
  },
  seo: {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://maisonvale.in",
    defaultTitle: "Maison Vale — Quietly Luxurious",
    defaultDescription:
      "Discover premium apparel, accessories, and home objects by Maison Vale. Designed with intention, crafted to last.",
    ogImage: "/og-default.jpg",
    twitterHandle: "@maisonvale",
  },
  colors: {
    // CSS variable names — actual hex lives in globals.css
    bgPrimary: "var(--color-bg-primary)",
    bgDeep: "var(--color-bg-deep)",
    surfaceLight: "var(--color-surface-light)",
    textOnDark: "var(--color-text-onDark)",
    textOnLight: "var(--color-text-onLight)",
    accentBrass: "var(--color-accent-brass)",
    accentWine: "var(--color-accent-wine)",
    hairline: "var(--color-hairline)",
  },
  fonts: {
    display: "Fraunces",
    body: "Switzer",
  },
  heroVideo: {
    src: "/hero.mp4",
    poster: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1920&q=80",
    alt: "Maison Vale Editorial Cinematic Video",
  },
} as const;

export type BrandConfig = typeof brandConfig;
