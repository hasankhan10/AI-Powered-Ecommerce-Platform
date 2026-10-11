import { RecommendedProduct } from '@/components/assistant/AssistantProductCard';
import { SupportOrderLookupResult } from '@/lib/db/support';

export type AIDomain =
  | 'SHOPPING_ASSISTANT'
  | 'CUSTOMER_SUPPORT'
  | 'COPYWRITING'
  | 'SEO_METADATA'
  | 'SEMANTIC_SEARCH';

export type ShoppingIntentType =
  | 'PRODUCT_RECOMMENDATION'
  | 'BUDGET_QUERY'
  | 'SPECIFIC_ITEM'
  | 'STYLING_ADVICE'
  | 'GIFT_SUGGESTION'
  | 'GENERAL_CHAT';

export type SupportIntentType =
  | 'ORDER_LOOKUP'
  | 'STORE_POLICY'
  | 'HUMAN_ESCALATION'
  | 'GENERAL_SUPPORT';

export interface ExtractedConstraints {
  maxPrice?: number;
  minPrice?: number;
  category?: string;
  materials?: string[];
  occasions?: string[];
  attributes?: string[];
  orderReference?: string;
  detectedLanguage?: string;
  isBudgetConstrained: boolean;
  cleanKeywords: string;
}

export interface IntentAnalysisResult {
  domain: AIDomain;
  subIntent: ShoppingIntentType | SupportIntentType | string;
  confidence: number;
  constraints: ExtractedConstraints;
  language: string;
}

export interface CatalogSearchFilter {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  limit?: number;
}

export interface CatalogSearchResult {
  products: RecommendedProduct[];
  totalAvailable: number;
  hasStrictBudgetMatch: boolean;
  lowestAvailablePrice: number;
  highestAvailablePrice: number;
  requestedMaxPrice?: number;
  isBudgetBelowCatalogueMinimum: boolean;
}

// Shopping Assistant Request / Response
export interface ShoppingAssistantRequest {
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  conversationId?: string | null;
  sessionId?: string;
  customerId?: string | null;
  productContext?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  stream?: boolean;
}

export interface ShoppingAssistantResult {
  text: string;
  products: RecommendedProduct[];
  conversationId: string;
  intent: IntentAnalysisResult;
  validation: {
    passed: boolean;
    productsVerified: number;
    budgetChecked: boolean;
    truthEnforced: boolean;
  };
}

// Support Request / Response
export interface SupportRequest {
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  customerEmail?: string;
  customerName?: string;
  ticketId?: string | null;
}

export interface SupportResult {
  content: string;
  isEscalated: boolean;
  orderData?: SupportOrderLookupResult['order'];
  intent: IntentAnalysisResult;
}

// Copywriting Request / Response
export type CopyTone = 'editorial' | 'minimal' | 'playful';

export interface ProductCopyContext {
  id?: string;
  name: string;
  categoryName?: string;
  basePrice?: number | string;
  currentDescription?: string | null;
  attributes?: string[];
}

export interface CopywritingRequest {
  product: ProductCopyContext;
  tone?: CopyTone;
  type?: 'DESCRIPTION' | 'TITLE';
  notes?: string;
}

export interface CopywritingResult {
  text: string;
  type: 'DESCRIPTION' | 'TITLE';
  tone?: CopyTone;
}

// SEO Request / Response
export interface SeoRequest {
  id?: string;
  name: string;
  categoryName?: string;
  basePrice?: number | string;
  description?: string | null;
}

export interface SeoResult {
  metaTitle: string;
  metaDescription: string;
  slug: string;
}

// Semantic Search Request / Response
export interface SearchEngineRequest {
  query: string;
  limit?: number;
}

export interface SearchEngineProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  score: number;
}

export interface SearchEngineCategory {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export interface SearchEngineResult {
  query: string;
  products: SearchEngineProduct[];
  categories: SearchEngineCategory[];
  constraints: ExtractedConstraints;
}
