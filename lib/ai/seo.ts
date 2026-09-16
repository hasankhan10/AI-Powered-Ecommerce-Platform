import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { brandConfig } from '@/config/brand.config';

export interface ProductSeoContext {
  id?: string;
  name: string;
  categoryName?: string;
  basePrice?: number | string;
  description?: string | null;
}

export interface GeneratedSeoResult {
  metaTitle: string;
  metaDescription: string;
  slug: string;
}

/**
 * Generate SEO-optimized meta title (50-60 chars), meta description (150-160 chars), and clean slug.
 */
export async function generateProductSEO(
  product: ProductSeoContext
): Promise<GeneratedSeoResult> {
  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GEMINI_API_KEY;

  const systemInstruction = `You are a world-class luxury SEO strategist and search engine metadata expert for ${brandConfig.name}.
Your job is to generate high-ranking, click-worthy, elegant SEO metadata for an ultra-premium product page.

Hard Rules:
1. metaTitle: EXACTLY 50 to 60 characters long (including spaces and brand suffix). Format: "[Product Name] — [Key Luxury Attribute] | ${brandConfig.name}". Never keyword stuff.
2. metaDescription: EXACTLY 150 to 160 characters long. Compelling, accurate, emphasizing craftsmanship and material quality with a subtle call to explore.
3. slug: Clean URL slug (lowercase, hyphenated, alphanumeric only, 2-5 words).

Output format: Return ONLY valid JSON matching:
{
  "metaTitle": "...",
  "metaDescription": "...",
  "slug": "..."
}`;

  const userPrompt = `
Product Name: ${product.name}
Category: ${product.categoryName || 'Luxury Collection'}
Base Price: ${brandConfig.currency.symbol}${product.basePrice || ''}
${product.description ? `Product Description: "${product.description}"` : ''}

Generate the optimized SEO JSON now.
`.trim();

  if (
    apiKey &&
    !apiKey.includes('placeholder') &&
    !apiKey.includes('your-gemini-api-key') &&
    apiKey.trim().length > 10
  ) {
    try {
      const google = createGoogleGenerativeAI({ apiKey });
      const { text } = await generateText({
        model: google('gemini-2.5-flash'),
        system: systemInstruction,
        prompt: userPrompt,
        temperature: 0.3,
      });

      const parsed = extractJson(text);
      if (parsed?.metaTitle && parsed?.metaDescription) {
        return {
          metaTitle: adjustTitleLength(parsed.metaTitle, product.name),
          metaDescription: adjustDescriptionLength(parsed.metaDescription, product),
          slug: cleanSlug(parsed.slug || product.name),
        };
      }
    } catch (err) {
      console.warn('Gemini SEO call failed, using luxury SEO fallback:', err);
    }
  }

  // Graceful bespoke fallback
  return generateFallbackSEO(product);
}

function extractJson(text: string): any {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    // ignore parse error
  }
  return null;
}

function cleanSlug(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function adjustTitleLength(title: string, productName: string): string {
  let cleaned = title.replace(/^["']|["']$/g, '').trim();
  if (cleaned.length < 45 && !cleaned.includes(brandConfig.name)) {
    cleaned = `${cleaned} | ${brandConfig.name}`;
  }
  if (cleaned.length > 60) {
    cleaned = cleaned.slice(0, 57) + '...';
  }
  return cleaned;
}

function adjustDescriptionLength(desc: string, product: ProductSeoContext): string {
  let cleaned = desc.replace(/^["']|["']$/g, '').trim();
  if (cleaned.length > 160) {
    cleaned = cleaned.slice(0, 157) + '...';
  }
  return cleaned;
}

/**
 * Deterministic, high-ranking luxury SEO fallback generator.
 */
function generateFallbackSEO(product: ProductSeoContext): GeneratedSeoResult {
  const name = product.name;
  const category = product.categoryName || 'Luxury Collection';

  // 1. Meta Title (Target 50-60 characters)
  const baseTitle = `${name} — Handcrafted ${category} | ${brandConfig.name}`;
  const metaTitle =
    baseTitle.length > 60
      ? `${name} — ${category} | ${brandConfig.name}`.slice(0, 60)
      : baseTitle.padEnd(52, ' ').trim();

  // 2. Meta Description (Target 150-160 characters)
  const descCandidate = `Discover the ${name} at ${brandConfig.name}. Handcrafted from artisanal natural materials with effortless silhouette and enduring elegance. Shop the collection online.`;
  const metaDescription =
    descCandidate.length > 160
      ? descCandidate.slice(0, 157) + '...'
      : descCandidate;

  // 3. Slug
  const slug = cleanSlug(name);

  return {
    metaTitle,
    metaDescription,
    slug,
  };
}
