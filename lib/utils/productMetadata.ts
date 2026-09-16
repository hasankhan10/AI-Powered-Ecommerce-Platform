export interface ProductMetadata {
  cleanDescription: string;
  isSocialProofEnabled: boolean;
  marketPrice: number | null;
}

/**
 * Parses embedded metadata (like market_price and social_proof toggles) from a raw product description.
 */
export function parseProductMetadata(rawDescription?: string | null): ProductMetadata {
  if (!rawDescription) {
    return {
      cleanDescription: '',
      isSocialProofEnabled: true,
      marketPrice: null,
    };
  }

  // Check social proof simulation toggle
  const isSocialProofDisabled = /<!--\s*social_proof:\s*disabled\s*-->/i.test(rawDescription);

  // Check market price: <!-- market_price: 6500 --> or <!-- market_price: 6500.00 -->
  const marketPriceMatch = rawDescription.match(/<!--\s*market_price:\s*([\d.]+)\s*-->/i);
  let marketPrice: number | null = null;
  if (marketPriceMatch && marketPriceMatch[1]) {
    const val = parseFloat(marketPriceMatch[1]);
    if (!isNaN(val) && val > 0) {
      marketPrice = val;
    }
  }

  // Clean out metadata comments from user-facing description
  const cleanDescription = rawDescription
    .replace(/<!--\s*social_proof:\s*(disabled|enabled)\s*-->/gi, '')
    .replace(/<!--\s*market_price:\s*[\d.]+\s*-->/gi, '')
    .trim();

  return {
    cleanDescription,
    isSocialProofEnabled: !isSocialProofDisabled,
    marketPrice,
  };
}

/**
 * Compiles a raw description containing metadata comments from component state.
 */
export function formatProductDescription(options: {
  cleanDescription?: string;
  enableSocialProof?: boolean;
  marketPrice?: number | null;
}): string {
  const parts: string[] = [];
  const text = (options.cleanDescription || '').trim();
  if (text) {
    parts.push(text);
  }

  if (options.enableSocialProof === false) {
    parts.push('<!-- social_proof: disabled -->');
  }

  if (options.marketPrice && options.marketPrice > 0) {
    parts.push(`<!-- market_price: ${options.marketPrice} -->`);
  }

  return parts.join('\n');
}
