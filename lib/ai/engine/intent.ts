import {
  AIDomain,
  ExtractedConstraints,
  IntentAnalysisResult,
  ShoppingIntentType,
  SupportIntentType,
} from './types';

// Occasions and materials mappings
const MATERIAL_KEYWORDS = [
  'linen',
  'silk',
  'cotton',
  'wool',
  'cashmere',
  'leather',
  'ceramic',
  'raffia',
  'gold',
  'brass',
  'velvet',
  'satin',
];

const OCCASION_KEYWORDS = [
  'wedding',
  'summer',
  'evening',
  'dinner',
  'party',
  'festive',
  'formal',
  'casual',
  'resort',
  'winter',
  'beach',
  'cocktail',
];

const CATEGORY_KEYWORDS: Record<string, string> = {
  dress: 'Apparel',
  dresses: 'Apparel',
  shirt: 'Apparel',
  shirts: 'Apparel',
  top: 'Apparel',
  blouse: 'Apparel',
  tunic: 'Apparel',
  pant: 'Apparel',
  pants: 'Apparel',
  trouser: 'Apparel',
  trousers: 'Apparel',
  blazer: 'Apparel',
  jacket: 'Apparel',
  coat: 'Apparel',
  apparel: 'Apparel',
  clothing: 'Apparel',
  perfume: 'Parfumerie',
  perfumes: 'Parfumerie',
  fragrance: 'Parfumerie',
  fragrances: 'Parfumerie',
  scent: 'Parfumerie',
  oud: 'Parfumerie',
  extrait: 'Parfumerie',
  bag: 'Leather Goods & Accessories',
  bags: 'Leather Goods & Accessories',
  clutch: 'Leather Goods & Accessories',
  tote: 'Leather Goods & Accessories',
  handbag: 'Leather Goods & Accessories',
  belt: 'Leather Goods & Accessories',
  scarf: 'Leather Goods & Accessories',
  scarves: 'Leather Goods & Accessories',
  wrap: 'Apparel',
  candle: 'Living & Atelier',
  candles: 'Living & Atelier',
  mug: 'Living & Atelier',
  mugs: 'Living & Atelier',
  runner: 'Living & Atelier',
  ceramic: 'Living & Atelier',
  living: 'Living & Atelier',
  decor: 'Living & Atelier',
};

/**
 * Detect language or dialect from prompt
 */
export function detectLanguage(text: string): string {
  const lower = text.toLowerCase();

  // Hindi / Hinglish indicators
  const hinglishPatterns = [
    /\b(mujhe|kuch|dikhao|chahiye|batao|kya|hai|yeh|woh|kitna|dam|paisa|rupaye|achha|accha|sasta|mehenga|sundar|kapde|kurta|dikhaiye)\b/i,
    /\b(kaun|kaunsa|kaisa|kaisi|thoda|kam|wala|wali|wale|ka|ki|ke|bhi|aur|mein|se|pe)\b/i,
  ];

  if (hinglishPatterns.some((pattern) => pattern.test(lower))) {
    return 'Hinglish';
  }

  // French indicators
  if (/\b(bonjour|merci|s'il vous plaît|robe|chemise|parfum|prix|montrez)\b/i.test(lower)) {
    return 'French';
  }

  // Spanish indicators
  if (/\b(hola|por favor|gracias|vestido|camisa|precio|muéstrame|cuánto)\b/i.test(lower)) {
    return 'Spanish';
  }

  return 'English';
}

/**
 * Extract price constraints, budget limits, categories, and keywords from natural language
 */
export function extractConstraints(prompt: string): ExtractedConstraints {
  const lower = prompt.toLowerCase();

  // 1. Price constraint detection
  let maxPrice: number | undefined;
  let minPrice: number | undefined;

  // Max price matches: "under 1000", "below 2000 rs", "within 3000", "less than ₹4000", "budget 1500", "upto 2500"
  const maxPriceRegexes = [
    /(?:under|below|less than|max|up to|upto|within|budget|not more than|maximum of|around|₹|rs\.?)\s*(\d+[\d,]*)/i,
    /(\d+[\d,]*)\s*(?:rs|inr|rupees|bucks|se kam|ke andar|tak)\b/i,
  ];

  for (const regex of maxPriceRegexes) {
    const match = prompt.match(regex);
    if (match && match[1]) {
      const parsed = parseInt(match[1].replace(/,/g, ''), 10);
      if (!isNaN(parsed) && parsed > 0) {
        maxPrice = parsed;
        break;
      }
    }
  }

  // Min price matches: "above 5000", "more than 3000", "starting from 4000", "min 2000"
  const minPriceRegexes = [
    /(?:above|over|more than|from|min|minimum|starting at|greater than)\s*(\d+[\d,]*)/i,
  ];

  for (const regex of minPriceRegexes) {
    const match = prompt.match(regex);
    if (match && match[1]) {
      const parsed = parseInt(match[1].replace(/,/g, ''), 10);
      if (!isNaN(parsed) && parsed > 0) {
        minPrice = parsed;
        break;
      }
    }
  }

  // 2. Order reference detection
  let orderReference: string | undefined;
  const orderMatch = prompt.match(/(?:MV-ORD-[\w-]+|ORD-[\w-]+|#?([0-9]{4,}))/i);
  if (orderMatch) {
    orderReference = orderMatch[0].trim();
  }

  // 3. Materials detection
  const detectedMaterials = MATERIAL_KEYWORDS.filter((mat) => lower.includes(mat));

  // 4. Occasions detection
  const detectedOccasions = OCCASION_KEYWORDS.filter((occ) => lower.includes(occ));

  // 5. Category detection
  let detectedCategory: string | undefined;
  for (const [kw, cat] of Object.entries(CATEGORY_KEYWORDS)) {
    const regex = new RegExp(`\\b${kw}\\b`, 'i');
    if (regex.test(lower)) {
      detectedCategory = cat;
      break;
    }
  }

  // 6. Clean keywords for query
  const cleanKeywords = prompt
    .replace(/(?:under|below|less than|max|up to|upto|within|budget|above|over|more than|₹|rs\.?)\s*\d+[\d,]*/gi, '')
    .replace(/\b(show|me|products|items|pieces|collection|give|recommend|looking for|want|need|please|mujhe|dikhao|chahiye)\b/gi, '')
    .replace(/[^\w\s]/g, ' ')
    .trim();

  return {
    maxPrice,
    minPrice,
    category: detectedCategory,
    materials: detectedMaterials,
    occasions: detectedOccasions,
    orderReference,
    detectedLanguage: detectLanguage(prompt),
    isBudgetConstrained: maxPrice !== undefined || minPrice !== undefined,
    cleanKeywords,
  };
}

/**
 * Classify user prompt into domain and sub-intent
 */
export function analyzeIntent(
  prompt: string,
  explicitDomain?: AIDomain
): IntentAnalysisResult {
  const lower = prompt.toLowerCase();
  const constraints = extractConstraints(prompt);
  const language = constraints.detectedLanguage || 'English';

  // If explicit domain is provided, classify sub-intent within that domain
  if (explicitDomain === 'CUSTOMER_SUPPORT') {
    let subIntent: SupportIntentType = 'GENERAL_SUPPORT';
    if (
      lower.includes('human') ||
      lower.includes('agent') ||
      lower.includes('representative') ||
      lower.includes('escalate') ||
      lower.includes('manager')
    ) {
      subIntent = 'HUMAN_ESCALATION';
    } else if (
      constraints.orderReference ||
      lower.includes('where is my order') ||
      lower.includes('track order') ||
      lower.includes('order status')
    ) {
      subIntent = 'ORDER_LOOKUP';
    } else if (
      lower.includes('return') ||
      lower.includes('refund') ||
      lower.includes('exchange') ||
      lower.includes('policy') ||
      lower.includes('shipping')
    ) {
      subIntent = 'STORE_POLICY';
    }

    return {
      domain: 'CUSTOMER_SUPPORT',
      subIntent,
      confidence: 0.95,
      constraints,
      language,
    };
  }

  if (explicitDomain === 'COPYWRITING') {
    return {
      domain: 'COPYWRITING',
      subIntent: 'GENERATE_COPY',
      confidence: 1.0,
      constraints,
      language,
    };
  }

  if (explicitDomain === 'SEO_METADATA') {
    return {
      domain: 'SEO_METADATA',
      subIntent: 'GENERATE_SEO',
      confidence: 1.0,
      constraints,
      language,
    };
  }

  if (explicitDomain === 'SEMANTIC_SEARCH') {
    return {
      domain: 'SEMANTIC_SEARCH',
      subIntent: 'SEARCH',
      confidence: 1.0,
      constraints,
      language,
    };
  }

  // Default: Shopping Assistant
  let subIntent: ShoppingIntentType = 'PRODUCT_RECOMMENDATION';

  if (constraints.isBudgetConstrained) {
    subIntent = 'BUDGET_QUERY';
  } else if (
    lower.includes('pair with') ||
    lower.includes('style this') ||
    lower.includes('match') ||
    lower.includes('wear with')
  ) {
    subIntent = 'STYLING_ADVICE';
  } else if (lower.includes('gift') || lower.includes('gifting') || lower.includes('present')) {
    subIntent = 'GIFT_SUGGESTION';
  } else if (
    constraints.category ||
    (constraints.materials?.length || 0) > 0 ||
    (constraints.occasions?.length || 0) > 0
  ) {
    subIntent = 'SPECIFIC_ITEM';
  } else if (
    /^(hi|hello|hey|namaste|good morning|good evening|who are you|help)\b/i.test(prompt.trim())
  ) {
    subIntent = 'GENERAL_CHAT';
  }

  return {
    domain: 'SHOPPING_ASSISTANT',
    subIntent,
    confidence: 0.92,
    constraints,
    language,
  };
}
