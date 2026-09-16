import { generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { brandConfig } from '@/config/brand.config';

export type CopyTone = 'editorial' | 'minimal' | 'playful';

export interface ProductCopyContext {
  id: string;
  name: string;
  categoryName?: string;
  basePrice?: number | string;
  currentDescription?: string | null;
  attributes?: string[];
}

export const TONE_DEFINITIONS: Record<
  CopyTone,
  {
    label: string;
    description: string;
    systemInstruction: string;
    styleGuide: string;
  }
> = {
  editorial: {
    label: 'Editorial',
    description: 'Poetic, narrative-rich luxury copy focusing on craftsmanship, drape, and enduring aesthetic value.',
    systemInstruction: `You are an elite fashion editor and creative copywriter for ${brandConfig.name}, an ultra-premium luxury house.
Your tone is evocative, refined, and cinematic. You emphasize artisanal heritage, tactile materiality, effortless drape, and poetic silhouette.
Avoid marketing jargon, hyperbole, exclamation marks, or generic ecommerce phrases like "must-have" or "upgrade your wardrobe".
Write with understated elegance and exquisite cadence. 2 to 3 fluid, sensory paragraphs.`,
    styleGuide: `Focus on tactile sensations, structural poise, mindful craftsmanship, and quiet confidence.`,
  },
  minimal: {
    label: 'Minimal',
    description: 'Ultra-concise, architectural, and direct. Focuses on cut, silhouette, and raw material purity.',
    systemInstruction: `You are an architectural copywriter and minimalist design critic for ${brandConfig.name}.
Your copy is disciplined, sharp, and stripped of excess ornamentation.
You describe the piece with precision: geometry, fiber integrity, cut, and understated utility.
Maximum 2 concise, impactful sentences (under 45 words total). No fluff, no exclamation marks.`,
    styleGuide: `Purity of form, tactile reality, unembellished truth, precision silhouette.`,
  },
  playful: {
    label: 'Playful',
    description: 'Sensory, spirited, and modern. Highlights effortless versatile styling, dynamic motion, and subtle wit.',
    systemInstruction: `You are a modern luxury culture writer and stylist for ${brandConfig.name}.
Your voice is vibrant, tactile, spirited, and delightfully confident.
You speak directly to the wearer with charisma and rhythmic allure, capturing how the piece moves through city evenings, sunlit escapes, and effortless transitions.
Keep it elevated and sophisticated — never cheap or gimmicky. 2 engaging, vivid paragraphs.`,
    styleGuide: `Dynamic motion, tactile joy, spirited styling pairings, charismatic confidence.`,
  },
};

/**
 * Generate luxury product description tailored to the selected tone.
 */
export async function generateProductCopy({
  product,
  tone = 'editorial',
}: {
  product: ProductCopyContext;
  tone: CopyTone;
}): Promise<string> {
  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GEMINI_API_KEY;

  const toneConfig = TONE_DEFINITIONS[tone] || TONE_DEFINITIONS.editorial;

  const userPrompt = `
Generate a captivating product description for the following item:

Product Name: ${product.name}
Category: ${product.categoryName || 'Luxury Collection'}
Base Price: ${brandConfig.currency.symbol}${product.basePrice || ''}
${product.currentDescription ? `Current Draft: "${product.currentDescription}"` : ''}

Tone: ${toneConfig.label.toUpperCase()} (${toneConfig.styleGuide})

Output only the polished, publish-ready product description text. Do not include markdown headers, quotes around the whole text, or introductory remarks.
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
        system: toneConfig.systemInstruction,
        prompt: userPrompt,
        temperature: tone === 'playful' ? 0.8 : tone === 'editorial' ? 0.7 : 0.4,
      });

      if (text && text.trim().length > 0) {
        return cleanGeneratedText(text);
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to deterministic luxury copy generator:', err);
    }
  }

  // Graceful bespoke fallback
  return generateFallbackCopy(product, tone);
}

function cleanGeneratedText(text: string): string {
  return text
    .trim()
    .replace(/^["']|["']$/g, '') // remove wrapping quotes
    .replace(/^#+\s+/gm, '') // remove markdown h1/h2 headings if any
    .replace(/^(Description|Product Copy):\s*/i, '');
}

/**
 * Deterministic, luxury bespoke copy generator when offline or API key is absent.
 */
function generateFallbackCopy(product: ProductCopyContext, tone: CopyTone): string {
  const name = product.name;
  const category = product.categoryName?.toLowerCase() || 'piece';

  if (tone === 'minimal') {
    const minimalTemplates = [
      `Constructed with disciplined restraint, the ${name} pairs architectural geometry with uncompromised material purity. Designed for effortless permanence.`,
      `A study in understated balance. The ${name} emphasizes raw textural integrity and an unembellished, fluid silhouette.`,
      `Tailored with singular precision, this ${category} articulates modern proportion through refined natural fibers.`,
    ];
    const index = Math.abs(hashCode(name)) % minimalTemplates.length;
    return minimalTemplates[index];
  }

  if (tone === 'playful') {
    const playfulTemplates = [
      `Meet the ${name} — a vibrant collision of effortless movement and tactile indulgence. Crafted to catch the golden hour light and carry you seamlessly from morning rendezvous into sunlit evenings.\n\nStyle it barefoot on travertine tiles or dressed up with brushed brass accents. It is ease, elevated to an art form.`,
      `Infused with spirited charm, the ${name} brings an unexpected rhythm to everyday luxury. Its tactile hand-feel and dynamic silhouette make every entrance feel like a quiet statement.\n\nPair with monochromatic staples or let it claim center stage. Confidence has never felt lighter.`,
    ];
    const index = Math.abs(hashCode(name)) % playfulTemplates.length;
    return playfulTemplates[index];
  }

  // Editorial fallback
  const editorialTemplates = [
    `Rooted in the quiet heritage of mindful craftsmanship, the ${name} is an homage to timeless form and organic tactile depth. Woven from carefully selected fibres, each line and seam is considered to achieve an instinctive, effortless drape.\n\nDesigned to live gracefully beyond seasons, this ${category} develops a richer character with every wear — capturing the subtle warmth of the Mediterranean and the poise of contemporary tailoring.`,
    `A masterclass in textural dialogue, the ${name} marries structural integrity with fluid sensuality. Every contour reflects the meticulous patience of our artisan ateliers, celebrating the natural variations of uncompromised textiles.\n\nSubtle yet unforgettable, it serves as the cornerstone for an intentional, curated wardrobe designed to endure.`,
  ];
  const index = Math.abs(hashCode(name)) % editorialTemplates.length;
  return editorialTemplates[index];
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
