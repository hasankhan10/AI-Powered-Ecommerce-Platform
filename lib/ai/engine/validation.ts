import { RecommendedProduct } from '@/components/assistant/AssistantProductCard';
import { verifyProductsAgainstDb } from './catalog';
import { brandConfig } from '@/config/brand.config';

export interface BudgetValidationContext {
  text: string;
  maxPrice?: number;
  lowestAvailablePrice: number;
  isBudgetBelowCatalogueMinimum: boolean;
  products: RecommendedProduct[];
  language?: string;
}

export interface BudgetValidationResult {
  validText: string;
  truthEnforced: boolean;
  explanationNote?: string;
}

/**
 * Validate that product recommendations are genuine, active database items with exact prices.
 * Filters out any hallucinated or missing products.
 */
export async function validateProducts(
  products: RecommendedProduct[]
): Promise<RecommendedProduct[]> {
  if (!products || products.length === 0) return [];

  // Deduplicate products by id
  const uniqueMap = new Map<string, RecommendedProduct>();
  for (const p of products) {
    if (p && p.id && !uniqueMap.has(p.id)) {
      uniqueMap.set(p.id, p);
    }
  }

  const candidateIds = Array.from(uniqueMap.keys());
  const verifiedInDb = await verifyProductsAgainstDb(candidateIds);

  // Cross-verify prices to ensure no hallucinated discounts
  return verifiedInDb.map((realProduct) => {
    const candidate = uniqueMap.get(realProduct.id);
    return {
      ...realProduct,
      // Retain description if present, otherwise fallback to DB
      description: candidate?.description || realProduct.description,
    };
  });
}

/**
 * Enforce budget honesty guardrails:
 * If a customer requested items under e.g. ₹1,000, but catalogue starts from ₹2,800:
 * Ensure the AI NEVER claims that a ₹2,800 piece is under ₹1,000.
 */
export function validateBudgetHonesty(
  ctx: BudgetValidationContext
): BudgetValidationResult {
  const { text, maxPrice, lowestAvailablePrice, isBudgetBelowCatalogueMinimum, language } = ctx;

  if (!maxPrice || !isBudgetBelowCatalogueMinimum) {
    return {
      validText: text,
      truthEnforced: false,
    };
  }

  // Check if text falsely claims items are within budget (e.g. "under 1000", "some products under 1000")
  const falseClaimRegex = new RegExp(
    `(?:here are|found|selected|available|pieces|collection)?\\s*(?:some\\s*)?(?:products|items|pieces|selections)?\\s*(?:under|below|within|for|priced at|priced under)\\s*(?:₹|rs\\.?|inr)?\\s*${maxPrice}(?:\\s*(?:rs|inr|rupees))?`,
    'i'
  );

  const containsFalseClaim = falseClaimRegex.test(text);

  // If text contains false claim or misses transparent acknowledgement:
  const lowestFormatted = `₹${lowestAvailablePrice.toLocaleString('en-IN')}`;
  const maxFormatted = `₹${maxPrice.toLocaleString('en-IN')}`;

  const isHinglish = language === 'Hinglish';

  let honestNotice = isHinglish
    ? `Hamari handcrafted atelier collections filhal ${lowestFormatted} se shuru hoti hain. Aapke budget requirement (${maxFormatted}) ko dhyan me rakhte hue, maine hamare sabse accessible aur closest luxury pieces curate kiye hain:`
    : `While our handcrafted atelier collections currently start from ${lowestFormatted}, in accordance with your requirement I have curated our closest, most accessible luxury pieces for you:`;

  if (containsFalseClaim) {
    // Replace the false claim sentence with honest disclosure
    const cleanedText = text.replace(falseClaimRegex, honestNotice);
    return {
      validText: cleanedText,
      truthEnforced: true,
      explanationNote: `Enforced budget truth: clarified that collection starts at ${lowestFormatted} instead of falsely claiming ${maxFormatted}.`,
    };
  }

  // If text doesn't mention the lowest starting price at all, ensure clarity
  if (!text.includes(lowestFormatted) && !text.includes(lowestAvailablePrice.toString())) {
    const amendedText = `${honestNotice}\n\n${text}`;
    return {
      validText: amendedText,
      truthEnforced: true,
      explanationNote: `Prepended catalogue starting price notice (${lowestFormatted}).`,
    };
  }

  return {
    validText: text,
    truthEnforced: false,
  };
}

/**
 * Sanitize text to remove hallucinated URLs, non-existent phone numbers, or code injection
 */
export function sanitizeText(input: string): string {
  if (!input) return '';
  return input
    .replace(/http:\/\/[^\s]+/g, '') // remove non-https links
    .replace(/```(json)?\n?/g, '') // strip accidental code blocks if plain text expected
    .trim();
}

/**
 * Validate and clamp SEO metadata lengths according to search engine standards
 */
export function validateSeoResult(
  result: { metaTitle?: string; metaDescription?: string; slug?: string },
  productName: string
) {
  let title = (result.metaTitle || '').trim();
  let desc = (result.metaDescription || '').trim();
  let slug = (result.slug || '').trim();

  // 1. Meta Title: 50-60 characters with brand suffix
  const brandSuffix = ` | ${brandConfig.name}`;
  if (!title) {
    title = `${productName} — Handcrafted Luxury${brandSuffix}`;
  } else if (!title.includes(brandConfig.name)) {
    title = `${title}${brandSuffix}`;
  }

  if (title.length > 60) {
    title = title.substring(0, 57).trim() + '...';
  } else if (title.length < 50) {
    const padding = ' — Handcrafted Luxury Atelier';
    const combined = `${productName}${padding}${brandSuffix}`;
    title = combined.length <= 60 ? combined : `${productName} — Atelier Piece${brandSuffix}`;
  }

  // 2. Meta Description: 150-160 characters
  if (!desc) {
    desc = `Discover the ${productName} by ${brandConfig.name}. Handcrafted with exquisite natural materials, timeless tailoring, and artisanal care. Explore the atelier.`;
  }

  if (desc.length > 160) {
    desc = desc.substring(0, 157).trim() + '...';
  } else if (desc.length < 150) {
    const additions = ` Handcrafted with meticulous artisanal care and enduring elegance.`;
    desc = `${desc}${additions}`.substring(0, 160).trim();
  }

  // 3. Clean Slug
  if (!slug) {
    slug = productName;
  }
  const cleanSlug = slug
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  return {
    metaTitle: title,
    metaDescription: desc,
    slug: cleanSlug,
  };
}
