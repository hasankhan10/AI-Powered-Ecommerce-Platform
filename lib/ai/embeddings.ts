import { embed } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

/**
 * Generate a dense vector embedding using Gemini text-embedding-004 with a deterministic fallback.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GEMINI_API_KEY;

  if (
    apiKey &&
    !apiKey.includes('placeholder') &&
    !apiKey.includes('your-gemini-api-key') &&
    apiKey.trim().length > 10
  ) {
    try {
      const google = createGoogleGenerativeAI({ apiKey });
      const { embedding } = await embed({
        model: google.textEmbeddingModel('text-embedding-004'),
        value: text.slice(0, 2048),
      });
      return embedding;
    } catch (err) {
      console.warn('Google embedding API call failed, using deterministic semantic embedding fallback:', err);
    }
  }

  return generateDeterministicEmbedding(text, 768);
}

/**
 * Deterministic semantic hashing that maps words, roots, and character n-grams to a normalized dense vector.
 */
export function generateDeterministicEmbedding(text: string, dimensions = 768): number[] {
  const vector = new Array(dimensions).fill(0);
  const normalized = text.toLowerCase().trim();
  const words = normalized.split(/\s+/).filter(Boolean);

  // Bag of words + n-grams hash projections
  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dimensions;
    vector[idx] += 1.0;

    // Subword n-grams
    for (let i = 0; i < word.length - 2; i++) {
      const trigram = word.substring(i, i + 3);
      let triHash = 0;
      for (let j = 0; j < trigram.length; j++) {
        triHash = (triHash << 5) - triHash + trigram.charCodeAt(j);
        triHash |= 0;
      }
      const triIdx = Math.abs(triHash) % dimensions;
      vector[triIdx] += 0.5;
    }
  }

  // Normalize vector to unit length (L2 norm)
  let sumSq = 0;
  for (let i = 0; i < dimensions; i++) {
    sumSq += vector[i] * vector[i];
  }

  const norm = Math.sqrt(sumSq) || 1;
  for (let i = 0; i < dimensions; i++) {
    vector[i] = vector[i] / norm;
  }

  return vector;
}

/**
 * Compute cosine similarity between two vectors.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
    return 0;
  }
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
