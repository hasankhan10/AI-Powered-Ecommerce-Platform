# Master Prompt Set — Full-Stack AI-Powered E-Commerce Platform
### Built for Google Antigravity · Reference Brand: "Maison Vale"

---

## 0. What This Document Is

**18 sequential prompts** that take an AI coding agent from an empty repo to a fully functional, production-grade, premium AI-powered e-commerce platform — real database, real payments, real AI, real admin dashboard, real AI SEO engine, real AI analytics. Every prompt is written to be copy-pasted directly into the agent, one at a time, and every prompt opens by re-establishing the agent's role and the platform's full mission — so even in a fresh task thread, the agent never loses sight of what it's actually building toward.

Per client, only three things ever change: **brand config, copy/content, and product data.** Every module, every AI feature, every dashboard stays exactly as built. That discipline is enforced from Prompt 1 onward — no brand name, color, or copy string is ever hardcoded inside a component.

---

## 1. How to Use This Document

1. Paste **Prompt 0.5** first as your `gemini.md` / Rules file — it carries the persona, the full mission, the hard architectural rules, and the design system, so every later task thread inherits it automatically.
2. Use **Planning mode** for every prompt — this is real full-stack work, not quick edits.
3. Paste prompts **1 through 17 in order**, one per task thread. After each one, actually run the app and check it before moving on.
4. Keep all API keys (database, AI, payments) in `.env.local` from the start.

---

## 2. Tech Stack

- **Framework:** Next.js latest version (App Router), TypeScript — Server Actions + Route Handlers as the backend layer
- **Database:** PostgreSQL via Supabase (Postgres + Auth + Storage + pgvector in one place)
- **ORM:** Prisma
- **Auth:** Supabase Auth — separate customer and role-gated admin flows (SUPERADMIN / ADMIN / SUPPORT)
- **Payments:** Razorpay (India-first, abstracted so Stripe can be added later)
- **AI:** Vercel AI SDK (`ai` package), defaulting to Google Gemini for chat, search, content generation, SEO generation, and embeddings — abstracted so the provider is a one-line swap, not a rewrite
- **Vector search:** pgvector on the Supabase Postgres instance
- **Styling:** Tailwind CSS on CSS-variable design tokens
- **Primitives:** shadcn/ui, behavior only, always fully restyled
- **Motion:** Framer Motion + GSAP/ScrollTrigger (the one cinematic hero) + Lenis (global smooth scroll)
- **State:** Zustand, synced to the database for logged-in users
- **Charts:** Tremor or Recharts, restyled
- **Storage:** Supabase Storage
- **Deploy target:** Vercel, one instance per client

---

## 3. Design System

### Color — warm espresso, not cold black
```
--color-bg-primary:    #1B1512
--color-bg-deep:       #14100D
--color-surface-light: #EDE6D8
--color-text-onDark:   #F2ECE0
--color-text-onLight:  #1B1512
--color-accent-brass:  #B08D57
--color-accent-wine:   #6E2430
--color-hairline:      rgba(242,236,224,0.14)
```
These are the reference brand's values — swappable per client via config, but the *token names* and the discipline of never hardcoding hex values never change. Brass and wine stay under 10% of any given screen.

### Typography
`Fraunces` (display, variable, Google Fonts) + `Switzer` (body/UI, Fontshare, free). Never Playfair Display or Inter. ~1.333 type scale, 16px base.

### Layout & Motion
Asymmetric editorial grids, varied-height product cards, sharp corners (0–2px radius), hairline borders instead of drop shadows. One deliberate motion moment — the homepage hero — everything else stays quiet. Respect `prefers-reduced-motion`. Avoid ALL-CAPS eyebrows, middle-dot meta text, arrow-suffixed buttons, decorative numbering, monospace data labels.

---

## PROMPT 0.5 — Persistent Project Rules
*Paste as your `gemini.md` / Rules file before any task.*

```
ROLE: You are a professional AI-powered software developer. You are
building a fully-functional, end-to-end, premium AI-powered e-commerce
platform — not a prototype, not a mockup. Every module must actually
work: real database, real payments, real AI calls, real admin control.

MISSION: The finished platform includes, at minimum: a complete
customer-facing storefront covering every section a real shopper needs
(browsing, search, product detail, cart, checkout, payment, account,
order tracking); an AI Shopping/Sales Assistant that actively helps
customers choose and buy products through real conversation, not a
static FAQ bot; a fully functional Admin Dashboard covering every
section an operator needs (products, orders, customers, content); an
AI SEO Engine that generates optimized titles, meta descriptions, and
structured data for every product; and AI-powered Business Analytics
that surfaces real insight from real store and conversation data. The
entire platform must look and feel premium — this is a design-forward
product, not a generic template.

WHITE-LABEL RULE: this codebase is reused across clients. No brand
name, color hex, font, or copy string may ever be hardcoded inside a
component. Brand/theme values come from /config/brand.config.ts. All
UI copy comes from /config/content.ts. Product data comes from the
database, never from arrays inside components.

UI/UX REFERENCE PERMISSION: you are encouraged to study and draw on
the best e-commerce experiences on the internet as your quality bar —
premium DTC and luxury brand sites, Apple's product pages, and other
award-recognized commerce experiences — for layout rhythm, interaction
patterns, micro-motion, and information architecture. Study the craft
and raise your own bar to match it. Never copy another brand's actual
logos, photography, copy, or trademarked visual identity — the
inspiration is the standard of quality and interaction design, not the
asset itself.

STACK: Next.js 14+ App Router, TypeScript, Prisma + Supabase Postgres,
Supabase Auth + Storage, Razorpay payments, Vercel AI SDK with Google
Gemini as the default provider (chat, search, content, SEO generation,
embeddings), pgvector, Tailwind CSS with CSS-variable tokens, shadcn/ui
(restyled), Framer Motion, GSAP + ScrollTrigger, Lenis, Zustand,
Tremor/Recharts.

DESIGN TOKENS (CSS variables in globals.css):
--color-bg-primary: #1B1512
--color-bg-deep: #14100D
--color-surface-light: #EDE6D8
--color-text-onDark: #F2ECE0
--color-text-onLight: #1B1512
--color-accent-brass: #B08D57
--color-accent-wine: #6E2430
--color-hairline: rgba(242,236,224,0.14)

DESIGN RULES: warm espresso not cold black; brass/wine under 10% of any
screen; sharp corners everywhere, hairline borders instead of drop
shadows; Fraunces for display text, Switzer for everything else, never
Playfair or Inter; asymmetric layouts, varied-height product cards;
motion is quiet everywhere except the homepage hero. Never use ALL-CAPS
eyebrows, middle-dot meta text, arrow-suffixed buttons, decorative
numbering, or monospace data labels.

This is real functionality end to end: every module reads and writes
real data through Prisma/Supabase, and every AI feature makes a real
call to Gemini with graceful error handling, never a hardcoded scripted
response.

Before proposing an implementation plan for any task, check this file
and flag anything that would conflict with it.
```

---

## PROMPT 1 — Database Schema & Project Foundation

```
You are a professional AI-powered software developer building a
fully-functional, end-to-end, premium AI-powered e-commerce platform.
This step lays the foundation everything else depends on.

1. Initialize Next.js 14 (App Router) + TypeScript. Install and
   configure Prisma pointed at a Supabase Postgres connection string
   from env vars, and enable the pgvector extension via migration.

2. Create the Prisma schema with these core models (add fields you
   judge necessary):
   - Category (id, name, slug, description)
   - Product (id, name, slug, description, metaTitle, metaDescription,
     ogImageUrl, basePrice, categoryId, status [draft/active/archived],
     embedding vector column, timestamps)
   - ProductVariant (id, productId, sku, size, color, price, stock)
   - ProductImage (id, productId, url, altText, position)
   - Customer (id, supabaseUserId, email, name, phone, timestamps)
   - Address (id, customerId, line1, line2, city, state, pincode,
     country, isDefault)
   - Cart (id, customerId nullable, sessionId nullable for guests)
   - CartItem (id, cartId, variantId, quantity)
   - Order (id, customerId, status, subtotal, shipping, tax, total,
     paymentStatus, paymentProvider, paymentRef, timestamps)
   - OrderItem (id, orderId, variantId, quantity, priceAtPurchase)
   - AdminUser (id, supabaseUserId, email, role, timestamps)
   - AssistantConversation (id, customerId nullable, startedAt)
   - AssistantMessage (id, conversationId, role, content,
     productRefs jsonb, createdAt)
   - SupportTicket (id, customerId, subject, status, timestamps)
   - SupportMessage (id, ticketId, role, content, createdAt)
   - ContentGeneration (id, productId, type [DESCRIPTION/SEO_TITLE/
     SEO_DESCRIPTION], tone, generatedText, isPublished, createdAt)
   - InventoryLog (id, variantId, changeQty, reason, createdAt)
   - IntegrationConnection (id, provider, status, config jsonb,
     timestamps)

3. Set up Supabase Auth: customer auth (email/OTP or Google) and admin
   auth (email/password, gated by the AdminUser table).

4. Create /config/brand.config.ts (name, logo URL, tagline, contact,
   social links) and /config/content.ts (every piece of storefront and
   dashboard copy) — pre-filled with Maison Vale's values, structured
   as the single source every future component reads from.

5. Seed the database with 10-12 realistic Maison Vale products across
   2-3 categories, with variants, images, and stock levels, via a
   re-runnable Prisma seed script.

Confirm schema, migrations, and seed all run cleanly before any UI.
```

---

## PROMPT 2 — Design Tokens, Fonts & Layout Shell

```
You are a professional AI-powered software developer continuing work
on this fully-functional, end-to-end, premium AI-powered e-commerce
platform. This step builds the visual and structural foundation.

1. Configure Tailwind to read all colors from CSS variables in
   globals.css — never Tailwind's default palette.
2. Load Fraunces and Switzer via next/font, set up a ~1.333 type scale
   as Tailwind utilities.
3. Install and configure shadcn/ui (primitives only), Framer Motion,
   GSAP + ScrollTrigger, Lenis, Zustand, Tremor or Recharts.
4. Build the persistent storefront shell: top nav (logo from
   brand.config.ts, cart/search/account icons), footer (copy from
   content.ts) — sharp corners, hairline borders, espresso/bone
   palette. Study premium e-commerce nav/footer patterns from the best
   sites on the internet as your bar for polish, without copying any
   specific brand's actual assets.
5. Wire up customer auth UI (sign in / sign up / account menu) via
   Supabase Auth, fully restyled to match tokens.

Show me the shell running, logged out and logged in.
```

---

## PROMPT 3 — Homepage: Cinematic Scroll Hero + Real Storefront

```
You are a professional AI-powered software developer continuing work
on this platform. This step builds the homepage — the first
impression that has to feel unmistakably premium.

HERO: full-bleed looping muted background video (placeholder, clearly
tagged for later client-asset replacement) with a GSAP ScrollTrigger-
pinned choreography across ~150-200vh of scroll: the video keeps
playing while overlaid headline/product text animates in and out based
on scroll position — like scrolling directs a short film, the way
Apple's product pages work. Respect prefers-reduced-motion with a
static fallback. This is the one place to genuinely study the best
scroll-driven storytelling on the internet and match that craft level.

BELOW THE HERO, using real data from the database and copy from
content.ts:
- "New Arrivals": asymmetric grid of the most recent active products
- One full-width editorial/brand-story section
- "Shop by Category" from real categories
- Footer (already built)

Keep AI Assistant and AI Search entry points visible in the nav,
wired up in later prompts.

Show me the live homepage.
```

---

## PROMPT 4 — Product Catalog & Product Detail Page

```
You are a professional AI-powered software developer continuing work
on this platform. This step builds the real product browsing
experience customers will spend most of their time in.

1. /shop and /shop/[category]: asymmetric product grid from the live
   database, working filters (price, size, color from real variant
   data) and sort.
2. /product/[slug]: real images and data, variant/size selector that
   correctly disables out-of-stock combinations, Add to Cart that
   writes to a real Cart/CartItem record, an "Ask the AI Stylist"
   entry point (wired in Prompt 8), and a "You may also like" section.

Study top-tier PDP layouts from premium e-commerce sites for pacing
and hierarchy, but build original layouts, not a copy of any one site.

Confirm stock and pricing always reflect the live database.
```

---

## PROMPT 5 — Cart, Checkout & Razorpay Payment

```
You are a professional AI-powered software developer continuing work
on this platform. This step makes the platform able to actually take
an order and get paid.

1. Cart drawer on real CartItem data with working quantity/removal.
2. Checkout: shipping address (saved to Address), order review, then
   real Razorpay integration (test keys from env) — create the Order
   as 'pending' before payment, verify the webhook/callback signature
   server-side, only mark 'paid' after real verification.
3. On success: decrement real stock, create OrderItems, show a real
   confirmation page with the actual order number.
4. Handle the payment-failed/cancelled path clearly.

Test end-to-end with Razorpay test cards and confirm the order appears
correctly in the database.
```

---

## PROMPT 6 — Admin Dashboard Shell & Auth

```
You are a professional AI-powered software developer continuing work
on this platform. This step builds the operator-facing side — this
needs every essential section a real store operator needs to run the
business day to day.

Build the Admin Dashboard shell, gated by real Supabase Auth +
AdminUser role checks (redirect non-admins server-side, not just hide
UI). Sidebar: Overview, Orders, Products, AI Business Analytics,
Inventory Intelligence, AI Content & SEO, Customer Support,
Integrations, Settings.

Overview page: real metric cards (Revenue, Orders, AI Conversations,
Conversion Rate) from real aggregate queries — honest low-data empty
states if there isn't enough real data yet, never fabricated numbers.
One real revenue-over-time chart, restyled to match tokens.

Confirm a non-admin is actually blocked from reaching this dashboard.
```

---

## PROMPT 7 — Product & Order Management (Admin CRUD)

```
You are a professional AI-powered software developer continuing work
on this platform. This step gives the operator full control over
catalog and orders.

1. Products: table of all products with full Create/Edit/Delete,
   variant management (size/color/price/stock), and real image
   uploads to Supabase Storage. Changes here reflect immediately on
   the live storefront.
2. Orders: table of all real orders with status/customer/total/payment
   status, and the ability to update fulfillment status (Processing →
   Shipped → Delivered), visible to the customer on their own order.

Confirm a new product appears live on the storefront immediately, and
zeroing stock correctly disables that variant on the PDP.
```

---

## PROMPT 8 — AI Shopping / Sales Assistant

```
You are a professional AI-powered software developer continuing work
on this platform. This step builds the centerpiece feature: an AI
Sales Assistant that actively helps a customer choose and buy — not a
scripted chatbot.

- Floating chat panel, fully restyled, launched from the nav/homepage
  icon.
- Real streaming responses from Gemini via a server-side route (never
  expose the API key client-side).
- Give the model function-calling access to a real product search
  function backed by Prisma (category, price range, size, keywords) so
  it recommends real, currently in-stock products, rendered as real
  inline product cards with a working Add to Cart — not just text.
- Persist every conversation to AssistantConversation/AssistantMessage
  so it feeds the Analytics dashboard later.
- Pull its persona/tone from content.ts (warm, knowledgeable personal
  stylist) so it's customizable per client, not hardcoded in the
  prompt call.
- Handle missing-API-key/error cases with a clear fallback, never a
  broken UI.

Test with "something for a summer wedding under ₹8000" and confirm it
returns real, correctly priced, actually-in-stock products.
```

---

## PROMPT 9 — AI Search (Semantic + Keyword)

```
You are a professional AI-powered software developer continuing work
on this platform. This step makes search actually understand intent,
not just match keywords.

1. Generate and store a Gemini embedding for every product's name +
   description, backfilled for existing products and auto-generated
   whenever a product is created/edited.
2. Cmd/Ctrl+K search overlay: real-time results combining keyword
   matching with pgvector cosine-similarity search, grouped sensibly
   (Products, Categories).
3. Support natural-language queries like "linen shirts under 5000" by
   parsing basic constraints (price ceiling, keywords) before running
   the vector search.
4. Fully keyboard accessible.

Confirm a natural-language query returns correct, real, in-stock
results — not just literal keyword hits.
```

---

## PROMPT 10 — AI Business Analytics

```
You are a professional AI-powered software developer continuing work
on this platform. This step gives the operator real, trustworthy
insight — not vanity numbers.

- Revenue/sales trend chart from real Order data with a comparison
  toggle.
- Top Products ranked by real order volume/revenue.
- An AI Assistant insights panel: most-requested-but-out-of-stock
  items (cross-referencing conversation product mentions against
  current stock), common question themes (a lightweight Gemini call
  can cluster/summarize recent conversations), AI-driven conversion
  rate (orders that followed an assistant conversation vs. those that
  didn't).
- Customer segment breakdown (new vs. returning) from real data.

Show honest low-volume states where real data is sparse — this
dashboard has to be trusted, not impressive-looking and wrong.
```

---

## PROMPT 11 — Inventory Intelligence

```
You are a professional AI-powered software developer continuing work
on this platform. This step gives the operator real forecasting, not
a static stock table.

- Stock overview table with status (In Stock/Low/Out of Stock) from a
  configurable low-stock threshold.
- Real restock recommendations: compute sales velocity per variant
  from real OrderItem history, project days-until-stockout, surface
  variants likely to sell out soon with a suggested reorder quantity —
  actual calculated logic.
- A demand forecast chart for one real product from its real order
  history.

Confirm recommendations update correctly after a test order draws
stock down.
```

---

## PROMPT 12 — AI Content Engine

```
You are a professional AI-powered software developer continuing work
on this platform. This step gives the operator an AI writing partner
for product copy.

- Pick any real product, generate a real product description via
  Gemini, with a tone selector (Editorial, Minimal, Playful) that
  genuinely changes the model prompt.
- "Regenerate" makes a real new call. "Publish" writes the result into
  the Product's real description field, live on the PDP immediately.
- Log every generation in ContentGeneration with a simple history list.

Confirm publishing updates the live PDP copy.
```

---

## PROMPT 13 — AI SEO Optimization Engine

```
You are a professional AI-powered software developer continuing work
on this platform. This step builds a dedicated AI SEO engine — every
product needs to be genuinely discoverable, not just well-written.

1. For any product, generate via Gemini: an SEO-optimized meta title
   (50-60 characters, product name + key attribute, no keyword
   stuffing), an SEO meta description (150-160 characters, compelling
   and accurate), and a clean URL slug suggestion.
2. Auto-generate these automatically the first time a product is
   created, and offer a one-click "Regenerate SEO" action in the admin
   Product editor at any time after.
3. Store each generation in ContentGeneration (type SEO_TITLE /
   SEO_DESCRIPTION) with the same history/publish pattern as the
   Content Engine — the operator reviews before it goes live, it's
   never silently overwritten.
4. Render the published metaTitle/metaDescription into real Next.js
   `<head>` metadata and Open Graph tags on the live PDP (verify with
   a real page-source check, not just in the admin preview).
5. Generate real JSON-LD Product structured data (price, availability,
   rating placeholder, image) on every PDP for search engine rich
   results.
6. Add a real dynamically generated `sitemap.xml` (all active products
   and categories) and `robots.txt`.

Confirm a real product's page source shows the correct title tag, meta
description, Open Graph tags, and valid JSON-LD — and that the sitemap
correctly includes every active product.
```

---

## PROMPT 14 — Customer Support AI

```
You are a professional AI-powered software developer continuing work
on this platform. This step handles post-purchase and general support
so customers aren't left stuck.

1. Customer-facing chat (can share UI patterns with the Shopping
   Assistant) backed by real Gemini calls with function-calling access
   to real order-status lookups for that logged-in customer, and store
   policy text pulled from content.ts. Persist to SupportTicket/
   SupportMessage.
2. Real escalation logic: an explicit "talk to a human" request or a
   simple confidence check marks the ticket 'escalated', never a fake
   hand-off.
3. Admin-facing queue: real list of tickets filterable by status, with
   resolution-time stats from real timestamps.

Confirm a real order-status question returns the correct real answer,
and an unresolvable one correctly escalates.
```

---

## PROMPT 15 — Integration Layer

```
You are a professional AI-powered software developer continuing work
on this platform. This step connects the platform to the tools a real
brand already uses.

- Razorpay: real connection status based on whether valid keys exist.
- One more fully real, working integration to prove the pattern:
  Resend (or similar) sending a genuine transactional order-
  confirmation email.
- Shipping (e.g. Shiprocket) and WhatsApp/CRM as connectable entries
  with a real settings form saved to IntegrationConnection.config
  (never rendering secrets back to the client) — the actual provider
  calls can be stubbed for now, but the connection-status pattern must
  be real and consistent across every integration, not faked
  differently per card.

Confirm a real test order triggers a real confirmation email.
```

---

## PROMPT 16 — White-Label Swap Test

```
You are a professional AI-powered software developer continuing work
on this platform. This step is the real test of whether the
architecture actually delivers on its purpose.

1. Create a second, genuinely different brand.config.ts and
   content.ts — different name, colors, tagline, fonts if desired —
   for a different product category (e.g. minimalist skincare) to
   prove the design system flexes, not just recolors.
2. Reseed the database with that brand's products.
3. Switch the app to the new config and confirm every page, every
   dashboard, the AI Assistant's persona/tone, the SEO output, and the
   email templates correctly reflect the new brand with zero component
   code changes.
4. Report exactly what, if anything, still required touching component
   code — that's a bug in the abstraction, not an acceptable manual
   step, and must be fixed.
```

---

## PROMPT 17 — Security, Performance & Responsive Audit

```
You are a professional AI-powered software developer continuing work
on this platform. This is the final production-readiness pass.

1. Security: no API keys exposed client-side, admin routes genuinely
   blocked server-side, Razorpay webhook signatures verified
   server-side, and customers can only ever access their own
   orders/addresses/tickets (check for IDOR by editing an order ID in
   the URL as a logged-in customer).
2. Responsive: hero, product grids, cart drawer, AI Assistant panel,
   and admin dashboard all degrade correctly at 375px and 768px.
3. Motion: hero remains the only heavily choreographed moment;
   prefers-reduced-motion respected everywhere.
4. Consistency: no stray hardcoded colors, no unrestyled shadcn
   defaults, no rounded cards, no hardcoded copy that should live in
   content.ts.
5. Performance: images via next/image, indexed queries on high-traffic
   pages, no obvious N+1 patterns.
6. Fix any console errors/warnings.

Give me a written summary of what you found and fixed, and flag
anything that needs my judgment call rather than a code fix.
```

---

## After This: Onboarding a Client

1. New Supabase + Vercel project for that client
2. Fill in their `/config/brand.config.ts` and `/config/content.ts`
3. Run the Prisma seed script with their real products
4. Set their Razorpay/email/integration keys in env vars
5. Deploy

If any step here ever requires opening a component file, that's the abstraction leaking — fix it at the source rather than patching per client.
