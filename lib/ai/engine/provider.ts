import { createGoogleGenerativeAI } from '@ai-sdk/google';

export interface AIProviderConfig {
  apiKey?: string;
  modelName?: string;
  temperature?: number;
}

/**
 * Get active Gemini API Key from environment
 */
export function getGeminiApiKey(): string | undefined {
  const key =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GEMINI_API_KEY;

  if (
    key &&
    !key.includes('placeholder') &&
    !key.includes('your-gemini-api-key') &&
    key.trim().length > 10
  ) {
    return key.trim();
  }

  return undefined;
}

/**
 * Check if the Gemini API is configured with a valid key
 */
export function isAIProviderAvailable(): boolean {
  return Boolean(getGeminiApiKey());
}

/**
 * Create or return Google Generative AI client instance
 */
export function getAIProvider(config: AIProviderConfig = {}) {
  const apiKey = config.apiKey || getGeminiApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY is not configured');
  }

  return createGoogleGenerativeAI({
    apiKey,
  });
}

/**
 * Standard default model identifier
 */
export const DEFAULT_AI_MODEL = 'gemini-2.5-flash';
export const DEFAULT_EMBEDDING_MODEL = 'text-embedding-004';
