import { centralAIEngine } from '@/lib/ai/engine';
import { brandConfig } from '@/config/brand.config';

export type CopyTone = 'editorial' | 'minimal' | 'playful';

export interface ProductCopyContext {
  id?: string;
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
 * Generate luxury product description tailored to the selected tone via Central AI Engine.
 */
export async function generateProductCopy({
  product,
  tone = 'editorial',
}: {
  product: ProductCopyContext;
  tone: CopyTone;
}): Promise<string> {
  const result = await centralAIEngine.orchestrateCopywriting({
    product,
    tone,
    type: 'DESCRIPTION',
  });

  return result.text;
}

/**
 * Generate an optimized, luxury-grade product title via Central AI Engine.
 */
export async function optimizeProductTitle({
  currentTitle,
  categoryName,
  notes,
}: {
  currentTitle: string;
  categoryName?: string;
  notes?: string;
}): Promise<string> {
  const result = await centralAIEngine.orchestrateCopywriting({
    product: {
      name: currentTitle,
      categoryName,
    },
    type: 'TITLE',
    notes,
  });

  return result.text;
}
