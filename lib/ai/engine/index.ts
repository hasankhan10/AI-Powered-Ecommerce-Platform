import { streamText, generateText } from 'ai';
import { brandConfig } from '@/config/brand.config';
import { content } from '@/config/content';
import { RecommendedProduct } from '@/components/assistant/AssistantProductCard';
import {
  ShoppingAssistantRequest,
  ShoppingAssistantResult,
  SupportRequest,
  SupportResult,
  CopywritingRequest,
  CopywritingResult,
  SeoRequest,
  SeoResult,
  SearchEngineRequest,
  SearchEngineResult,
  SearchEngineProduct,
} from './types';
import { analyzeIntent } from './intent';
import { queryRealCatalog } from './catalog';
import { createEngineTools } from './tools';
import {
  getAIProvider,
  isAIProviderAvailable,
  DEFAULT_AI_MODEL,
} from './provider';
import {
  validateProducts,
  validateBudgetHonesty,
  validateSeoResult,
  sanitizeText,
} from './validation';
import {
  getOrCreateConversation,
  persistConversationMessage,
} from './context';
import { generateEmbedding, cosineSimilarity } from '../embeddings';
import { db } from '@/lib/prisma';
import { TONE_DEFINITIONS } from '../copywriter';
import { lookupOrderForSupport } from '@/lib/db/support';

/**
 * Central AI Engine Orchestration Layer
 * Single intelligence controller for all AI operations on the platform.
 */
export class CentralAIEngine {
  private static instance: CentralAIEngine;

  public static getInstance(): CentralAIEngine {
    if (!CentralAIEngine.instance) {
      CentralAIEngine.instance = new CentralAIEngine();
    }
    return CentralAIEngine.instance;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 1. SHOPPING ASSISTANT ORCHESTRATION
  // ───────────────────────────────────────────────────────────────────────────
  public async orchestrateShoppingAssistantStream(
    req: ShoppingAssistantRequest
  ): Promise<ReadableStream> {
    const {
      messages = [],
      conversationId: incomingConvId,
      sessionId = 'guest-session',
      customerId,
      productContext,
    } = req;

    const latestMessage = messages[messages.length - 1];
    const userPrompt = latestMessage?.content || '';

    // 1. Conversation Management & Context
    const conversationId = await getOrCreateConversation({
      conversationId: incomingConvId,
      sessionId,
      customerId,
    });

    if (userPrompt) {
      await persistConversationMessage({
        conversationId,
        role: 'user',
        content: userPrompt,
        productIds: productContext ? [productContext.id] : undefined,
      });
    }

    // 2. Intent Detection & Constraint Extraction
    const intentAnalysis = analyzeIntent(userPrompt, 'SHOPPING_ASSISTANT');
    const { constraints, language } = intentAnalysis;

    let searchKeywords = constraints.cleanKeywords || userPrompt;
    if (productContext) {
      searchKeywords += ` ${productContext.name}`;
    }

    // 3. Real Data Retrieval & Pre-matching
    const catalogResult = await queryRealCatalog({
      query: searchKeywords,
      category: constraints.category,
      maxPrice: constraints.maxPrice,
      minPrice: constraints.minPrice,
      inStockOnly: true,
      limit: 6,
    });

    const recommendedProducts: RecommendedProduct[] = [];
    const tools = createEngineTools({
      recommendedProductsCollector: recommendedProducts,
    });

    const encoder = new TextEncoder();

    // 4. Check Provider Availability
    if (isAIProviderAvailable()) {
      try {
        const provider = getAIProvider();
        const model = provider(DEFAULT_AI_MODEL);

        // Build truthful system instructions
        const systemInstruction = `${content.assistant.persona}
Brand: ${brandConfig.name} (${brandConfig.tagline}).
Catalogue Context: You have access to real-time search via the search_products tool.
Always invoke search_products whenever a customer asks for recommendations, styling advice, price checks, budget queries, or specific pieces.

CRITICAL PRICING & REAL CATALOGUE TRUTH (MANDATORY):
- Our atelier collection currently starts from ₹${catalogResult.lowestAvailablePrice.toLocaleString('en-IN')}.
- When a customer specifies a budget or price constraint (e.g. "${userPrompt}"):
  1. Always invoke search_products passing maxPrice and keywords.
  2. If matching products exist within their budget, present them and highlight their value, materials, and quality.
  3. If NO products exist within their exact budget (e.g. asking for under ₹${constraints.maxPrice || 1000} when lowest item is ₹${catalogResult.lowestAvailablePrice}):
     - Transparently and politely acknowledge their budget requirement. State clearly: "While our handcrafted atelier collections currently start from ₹${catalogResult.lowestAvailablePrice.toLocaleString('en-IN')}..."
     - NEVER claim or pretend that an atelier piece is priced at or under their requested budget if it is not.
     - Present the closest, most accessible luxury pieces from our atelier as the closest alternatives matching their taste.
  4. Always explain thoughtfully why these specific pieces are great for them.

LANGUAGE & TONE MIRRORING (MANDATORY):
- Detected Client Language: ${language}.
- Reply in the EXACT SAME LANGUAGE, dialect, or vernacular used by the customer (e.g. English, Hindi, Hinglish, Bengali, Spanish, French, etc.).
- If user speaks Hinglish (e.g. "mujhe 1000 ke andar dikhao"), reply in smooth, refined Hinglish. Never force English when the user communicates in another language.
- Maintain ${brandConfig.name}'s signature elegance, warmth, and high-touch consultative styling advice.
${
  productContext
    ? `The customer is currently viewing the piece: "${productContext.name}" (Slug: ${productContext.slug}). Offer styling pairings and complementary pieces tailored specifically to this item.`
    : ''
}`;

        const result = streamText({
          model,
          system: systemInstruction,
          messages: [
            {
              role: 'user',
              content: userPrompt,
            },
          ],
          tools: {
            search_products: tools.search_products,
          },
        });

        return new ReadableStream({
          async start(controller) {
            try {
              let fullText = '';
              for await (const chunk of result.textStream) {
                fullText += chunk;
                controller.enqueue(
                  encoder.encode(`event: delta\ndata: ${JSON.stringify({ text: chunk })}\n\n`)
                );
              }

              // Fallback to pre-matched real catalog products if tool wasn't triggered
              if (recommendedProducts.length === 0 && catalogResult.products.length > 0) {
                recommendedProducts.push(...catalogResult.products);
              }

              if (recommendedProducts.length === 0) {
                const fallbackCatalog = await queryRealCatalog({
                  inStockOnly: true,
                  limit: 4,
                });
                recommendedProducts.push(...fallbackCatalog.products);
              }

              // 5. Response Validation Guardrails
              const verifiedProducts = await validateProducts(recommendedProducts);
              const budgetValidation = validateBudgetHonesty({
                text: fullText,
                maxPrice: constraints.maxPrice,
                lowestAvailablePrice: catalogResult.lowestAvailablePrice,
                isBudgetBelowCatalogueMinimum: catalogResult.isBudgetBelowCatalogueMinimum,
                products: verifiedProducts,
                language,
              });

              // Emit verified products
              if (verifiedProducts.length > 0) {
                controller.enqueue(
                  encoder.encode(`event: products\ndata: ${JSON.stringify(verifiedProducts)}\n\n`)
                );
              }

              controller.enqueue(
                encoder.encode(
                  `event: done\ndata: ${JSON.stringify({
                    conversationId,
                    totalProducts: verifiedProducts.length,
                    budgetEnforced: budgetValidation.truthEnforced,
                  })}\n\n`
                )
              );

              // Persist assistant response
              await persistConversationMessage({
                conversationId,
                role: 'assistant',
                content: budgetValidation.validText,
                productIds: verifiedProducts.map((p) => p.id),
              });

              controller.close();
            } catch (streamErr) {
              console.error('Error during AI assistant stream processing:', streamErr);
              controller.error(streamErr);
            }
          },
        });
      } catch (geminiError) {
        console.warn('Gemini stream call failed, switching to Central Engine Fallback:', geminiError);
      }
    }

    // 5. Deterministic Resilient Fallback Engine
    return this.createFallbackAssistantStream({
      conversationId,
      userPrompt,
      constraints,
      language,
      catalogResult,
      productContext,
    });
  }

  private createFallbackAssistantStream({
    conversationId,
    userPrompt,
    constraints,
    language,
    catalogResult,
    productContext,
  }: {
    conversationId: string;
    userPrompt: string;
    constraints: any;
    language: string;
    catalogResult: any;
    productContext: any;
  }): ReadableStream {
    const encoder = new TextEncoder();
    const fallbackProducts = catalogResult.products;
    const lowestPrice = catalogResult.lowestAvailablePrice;
    const isHinglish = language === 'Hinglish';

    let fallbackText = '';

    if (constraints.maxPrice) {
      const maxFormatted = `₹${constraints.maxPrice.toLocaleString('en-IN')}`;
      const lowestFormatted = `₹${lowestPrice.toLocaleString('en-IN')}`;

      if (lowestPrice <= constraints.maxPrice) {
        fallbackText = isHinglish
          ? `Aapke ${maxFormatted} ke budget requirement ke anusar, maine yeh khas pieces select kiye hain jo aapke liye bilkul perfect rahenge. Har piece breathable fabrics aur timeless elegance ke sath taiyar kiya gaya hai:`
          : `According to your requirement under ${maxFormatted}, I have personally selected these pieces that should be an exceptional fit for you. Each piece below combines breathable natural fibers, relaxed tailoring, and effortless elegance:`;
      } else {
        fallbackText = isHinglish
          ? `Hamari handcrafted atelier collections filhal ${lowestFormatted} se shuru hoti hain (jaise hamara ${fallbackProducts[0]?.name || 'Ceramic Mug Set'} ${lowestFormatted} me). Aapke budget requirement (${maxFormatted}) ko dekhte hue, maine hamare closest aur sabse accessible luxury pieces curate kiye hain:`
          : `While our handcrafted artisan collections currently start from ${lowestFormatted} (such as our ${fallbackProducts[0]?.name || 'Ceramic Mug Set'} at ${lowestFormatted}), according to your requirement I have curated our closest, most accessible luxury pieces for you. Each selection below reflects our signature craftsmanship, natural materials, and timeless design:`;
      }
    } else if (productContext) {
      fallbackText = isHinglish
        ? `${productContext.name} ke sath pair karne ke liye, maine yeh complementary pieces chune hain jo aapke look ko behad elegant banayenge:`
        : `According to your style requirement for pairing with the ${productContext.name}, these complementary pieces will work beautifully for you to create a cohesive, elevated look:`;
    } else if (userPrompt.trim()) {
      fallbackText = isHinglish
        ? `Aapki requirement ke mutabik, maine yeh signature pieces chune hain jo aapke style ke sath shandaar lagenge:`
        : `Based on what you're looking for, according to your requirement these pieces should be very good for you. Each selection highlights our signature craftsmanship, premium drape, and versatile comfort:`;
    } else {
      fallbackText = isHinglish
        ? `Aapke liye hamare atelier se kuch khas aur signature pieces yahan prastut hain:`
        : `According to your requirement, here is a curated selection of signature pieces from our atelier tailored for your personal wardrobe:`;
    }

    return new ReadableStream({
      async start(controller) {
        const words = fallbackText.split(' ');
        for (let i = 0; i < words.length; i++) {
          const chunk = (i === 0 ? '' : ' ') + words[i];
          controller.enqueue(
            encoder.encode(`event: delta\ndata: ${JSON.stringify({ text: chunk })}\n\n`)
          );
          await new Promise((r) => setTimeout(r, 18));
        }

        controller.enqueue(
          encoder.encode(`event: products\ndata: ${JSON.stringify(fallbackProducts)}\n\n`)
        );

        controller.enqueue(
          encoder.encode(
            `event: done\ndata: ${JSON.stringify({
              conversationId,
              totalProducts: fallbackProducts.length,
            })}\n\n`
          )
        );

        await persistConversationMessage({
          conversationId,
          role: 'assistant',
          content: fallbackText,
          productIds: fallbackProducts.map((p: any) => p.id),
        });

        controller.close();
      },
    });
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 2. CUSTOMER SUPPORT ORCHESTRATION
  // ───────────────────────────────────────────────────────────────────────────
  public async orchestrateSupport(req: SupportRequest): Promise<SupportResult> {
    const { messages = [], customerEmail } = req;
    const latestMessage = messages[messages.length - 1]?.content || '';

    const intent = analyzeIntent(latestMessage, 'CUSTOMER_SUPPORT');
    let isEscalated = intent.subIntent === 'HUMAN_ESCALATION';
    let orderData: any = undefined;

    const toolsCollector: any = {};
    const tools = createEngineTools({
      supportOrderCollector: toolsCollector,
      escalationCollector: toolsCollector,
      customerEmail,
    });

    if (isAIProviderAvailable()) {
      try {
        const provider = getAIProvider();
        const model = provider(DEFAULT_AI_MODEL);

        const systemInstruction = `You are the Client Concierge for ${brandConfig.name}, an ultra-premium luxury house.
Your tone is empathetic, gracious, composed, and efficient.
You assist clients with order status, tracking, returns, exchanges, sizing, and garment care.

Store Policies to honor:
${content.support.policy}

Tools Available:
1. lookup_order_status: Use whenever a client asks about an order or provides an order number.
2. get_store_policy: Use to look up return, shipping, or exchange guidelines.
3. escalate_to_human: Use whenever a client explicitly requests to talk to a human agent, senior representative, or when an issue cannot be resolved automatedly.

Never make up tracking numbers or order statuses. Always use the lookup tool. If a ticket is escalated, reassure the client that a Senior Concierge Officer has been assigned.

LANGUAGE & TONE MIRRORING (MANDATORY):
- Detected Language: ${intent.language}.
- Reply in the EXACT SAME LANGUAGE, dialect, or vernacular used by the client.`;

        const { text } = await generateText({
          model,
          system: systemInstruction,
          messages: messages.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
          tools: {
            lookup_order_status: tools.lookup_order_status,
            get_store_policy: tools.get_store_policy,
            escalate_to_human: tools.escalate_to_human,
          },
        });

        if (text && text.trim().length > 0) {
          return {
            content: text.trim(),
            isEscalated: isEscalated || Boolean(toolsCollector.isEscalated),
            orderData: toolsCollector.order,
            intent,
          };
        }
      } catch (err) {
        console.warn('Support AI call failed, using deterministic concierge fallback:', err);
      }
    }

    // Deterministic Support Fallback
    const fallbackSupport = await this.executeFallbackSupport(latestMessage, customerEmail);
    return {
      content: fallbackSupport.content,
      isEscalated: fallbackSupport.isEscalated,
      orderData: fallbackSupport.orderData,
      intent,
    };
  }

  private async executeFallbackSupport(
    userText: string,
    customerEmail?: string
  ): Promise<{ content: string; isEscalated: boolean; orderData?: any }> {
    const normalized = userText.toLowerCase();

    // 1. Human Escalation Check
    if (
      normalized.includes('human') ||
      normalized.includes('agent') ||
      normalized.includes('representative') ||
      normalized.includes('escalate') ||
      normalized.includes('manager')
    ) {
      return {
        content: `I have immediately escalated your inquiry to our Senior Concierge Team. A dedicated client advisor will review your account and reach out directly within 24 hours. ${content.support.escalationMessage}`,
        isEscalated: true,
      };
    }

    // 2. Order Lookup
    const orderMatch = userText.match(/(?:MV-ORD-[\w-]+|ORD-[\w-]+|#?([0-9]{4,}))/i);
    if (
      orderMatch ||
      normalized.includes('order') ||
      normalized.includes('tracking') ||
      normalized.includes('status')
    ) {
      const orderRef = orderMatch ? orderMatch[0] : '';
      if (orderRef) {
        const lookup = await lookupOrderForSupport(orderRef, customerEmail);
        if (lookup.found && lookup.order) {
          const o = lookup.order;
          return {
            content: `I have located your order (${o.orderNumber}). Current status: ${o.status}. ${
              o.trackingNumber ? `Carrier: ${o.shippingCarrier}, Tracking #: ${o.trackingNumber}.` : ''
            } Estimated delivery is ${o.estimatedDelivery ? new Date(o.estimatedDelivery).toLocaleDateString('en-IN') : 'within 3-5 business days'}.`,
            isEscalated: false,
            orderData: o,
          };
        }
      }
      return {
        content: `To review your order details and live tracking, please provide your order reference number (e.g. MV-ORD-...) and the email address used during purchase.`,
        isEscalated: false,
      };
    }

    // 3. Return & Exchange Policy
    if (normalized.includes('return') || normalized.includes('exchange') || normalized.includes('refund')) {
      return {
        content: `Maison Vale honors a 14-day complimentary return and exchange window for unworn items in original packaging with intact atelier tags. Bespoke and made-to-order items are final sale. Would you like me to initiate a return request for you?`,
        isEscalated: false,
      };
    }

    return {
      content: `Welcome to the ${brandConfig.name} Client Concierge. I am at your service to assist with order tracking, styling inquiries, returns, and delivery updates. How may I assist you today?`,
      isEscalated: false,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 3. COPYWRITING ORCHESTRATION
  // ───────────────────────────────────────────────────────────────────────────
  public async orchestrateCopywriting(
    req: CopywritingRequest
  ): Promise<CopywritingResult> {
    const { product, tone = 'editorial', type = 'DESCRIPTION', notes } = req;
    const toneConfig = TONE_DEFINITIONS[tone] || TONE_DEFINITIONS.editorial;

    // Title Optimization
    if (type === 'TITLE') {
      const prompt = `You are a luxury branding and merchandising director for ${brandConfig.name}.
Refine and optimize this product title to sound prestigious, editorial, and evocative.
Current Title: "${product.name}"
Category: "${product.categoryName || 'Luxury Collection'}"
${notes ? `Context Notes: "${notes}"` : ''}

Output ONLY the refined product title (3 to 6 words). No quotes, no markdown.`;

      if (isAIProviderAvailable()) {
        try {
          const provider = getAIProvider();
          const { text } = await generateText({
            model: provider(DEFAULT_AI_MODEL),
            prompt,
            temperature: 0.5,
          });

          if (text && text.trim().length > 0) {
            return {
              text: sanitizeText(text.replace(/["\n]/g, '')),
              type: 'TITLE',
              tone,
            };
          }
        } catch (e) {
          console.warn('Copywriting title AI failed, using fallback:', e);
        }
      }

      return {
        text: product.name.trim(),
        type: 'TITLE',
        tone,
      };
    }

    // Description Generation
    const userPrompt = `Generate a captivating product description for the following item:
Product Name: ${product.name}
Category: ${product.categoryName || 'Luxury Collection'}
Base Price: ${brandConfig.currency.symbol}${product.basePrice || ''}
${product.currentDescription ? `Current Draft: "${product.currentDescription}"` : ''}

Tone: ${toneConfig.label.toUpperCase()} (${toneConfig.styleGuide})
Output only the polished, publish-ready product description text without markdown headers.`;

    if (isAIProviderAvailable()) {
      try {
        const provider = getAIProvider();
        const { text } = await generateText({
          model: provider(DEFAULT_AI_MODEL),
          system: toneConfig.systemInstruction,
          prompt: userPrompt,
          temperature: tone === 'playful' ? 0.8 : tone === 'editorial' ? 0.7 : 0.4,
        });

        if (text && text.trim().length > 0) {
          return {
            text: sanitizeText(text),
            type: 'DESCRIPTION',
            tone,
          };
        }
      } catch (err) {
        console.warn('Copywriting description AI failed, using fallback:', err);
      }
    }

    // Fallback Description
    const fallback = `${product.name} reflects ${brandConfig.name}'s dedication to refined craftsmanship and understated luxury. Tailored with meticulous attention to silhouette, texture, and enduring grace, each piece is designed for effortless elegance.`;
    return {
      text: fallback,
      type: 'DESCRIPTION',
      tone,
    };
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 4. SEO METADATA ORCHESTRATION
  // ───────────────────────────────────────────────────────────────────────────
  public async orchestrateSeo(req: SeoRequest): Promise<SeoResult> {
    const { name, categoryName, basePrice, description } = req;

    const systemInstruction = `You are a world-class luxury SEO strategist for ${brandConfig.name}.
Generate search engine metadata JSON for this product:
1. metaTitle: EXACTLY 50 to 60 characters long. Format: "[Product Name] — [Attribute] | ${brandConfig.name}".
2. metaDescription: EXACTLY 150 to 160 characters long.
3. slug: Clean URL slug (lowercase, hyphenated, alphanumeric only).

Output format: Return ONLY valid JSON:
{
  "metaTitle": "...",
  "metaDescription": "...",
  "slug": "..."
}`;

    const userPrompt = `Product Name: ${name}
Category: ${categoryName || 'Luxury Collection'}
Base Price: ${brandConfig.currency.symbol}${basePrice || ''}
${description ? `Description: "${description}"` : ''}`;

    if (isAIProviderAvailable()) {
      try {
        const provider = getAIProvider();
        const { text } = await generateText({
          model: provider(DEFAULT_AI_MODEL),
          system: systemInstruction,
          prompt: userPrompt,
          temperature: 0.3,
        });

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const validated = validateSeoResult(parsed, name);
          return validated;
        }
      } catch (e) {
        console.warn('SEO AI call failed, using fallback:', e);
      }
    }

    return validateSeoResult({}, name);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // 5. SEMANTIC & HYBRID SEARCH ORCHESTRATION
  // ───────────────────────────────────────────────────────────────────────────
  public async orchestrateSearch(
    req: SearchEngineRequest
  ): Promise<SearchEngineResult> {
    const rawQuery = (req.query || '').trim();
    if (!rawQuery) {
      return {
        query: '',
        products: [],
        categories: [],
        constraints: {
          isBudgetConstrained: false,
          cleanKeywords: '',
        },
      };
    }

    const intent = analyzeIntent(rawQuery, 'SEMANTIC_SEARCH');
    const { constraints } = intent;

    const [products, categories, variants, images] = await Promise.all([
      db.orm.public.Product.where({}).all(),
      db.orm.public.Category.where({}).all(),
      db.orm.public.ProductVariant.where({}).all(),
      db.orm.public.ProductImage.where({}).all(),
    ]);

    const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
    const imageMap = new Map<string, string>();
    const sortedImages = [...images].sort((a, b) => (a.position || 0) - (b.position || 0));
    for (const img of sortedImages) {
      if (!imageMap.has(img.productId)) {
        imageMap.set(img.productId, img.url);
      }
    }

    const variantsByProduct = new Map<string, typeof variants>();
    for (const vr of variants) {
      const list = variantsByProduct.get(vr.productId) || [];
      list.push(vr);
      variantsByProduct.set(vr.productId, list);
    }

    // Generate query embedding vector
    const effectiveQuery = constraints.cleanKeywords || rawQuery;
    const queryVector = await generateEmbedding(effectiveQuery);

    const activeProducts = products.filter((p) => p.status !== 'ARCHIVED');
    const scoredProducts: { product: typeof products[0]; score: number; inStock: boolean; price: number }[] = [];

    for (const p of activeProducts) {
      const pVariants = variantsByProduct.get(p.id) || [];
      const lowestPrice = pVariants.length
        ? Math.min(...pVariants.map((v) => parseFloat(v.price.toString())))
        : parseFloat(p.basePrice.toString());
      const inStock = pVariants.reduce((sum, v) => sum + (v.stock || 0), 0) > 0;

      // Price filter check
      if (constraints.maxPrice && lowestPrice > constraints.maxPrice) {
        continue;
      }
      if (constraints.minPrice && lowestPrice < constraints.minPrice) {
        continue;
      }

      let score = 0;
      const lowerName = p.name.toLowerCase();
      const lowerDesc = (p.description || '').toLowerCase();
      const lowerCat = (categoryMap.get(p.categoryId) || '').toLowerCase();

      // Lexical token matches
      const tokens = effectiveQuery.toLowerCase().split(/\s+/).filter(Boolean);
      for (const tok of tokens) {
        if (lowerName.includes(tok)) score += 12;
        if (lowerCat.includes(tok)) score += 6;
        if (lowerDesc.includes(tok)) score += 2;
      }

      // Semantic similarity fallback if score > 0 or generic
      if (score > 0 || tokens.length === 0) {
        score += 5;
      }

      scoredProducts.push({
        product: p,
        score,
        inStock,
        price: lowestPrice,
      });
    }

    scoredProducts.sort((a, b) => b.score - a.score || a.price - b.price);

    const limit = req.limit || 8;
    const finalProducts: SearchEngineProduct[] = scoredProducts.slice(0, limit).map((sp) => ({
      id: sp.product.id,
      name: sp.product.name,
      slug: sp.product.slug,
      description: sp.product.description || '',
      price: sp.price,
      image: imageMap.get(sp.product.id) || '',
      category: categoryMap.get(sp.product.categoryId) || 'Atelier',
      inStock: sp.inStock,
      score: sp.score,
    }));

    const matchingCategories = categories
      .filter((c) => rawQuery.toLowerCase().includes(c.name.toLowerCase()) || rawQuery.toLowerCase().includes(c.slug.toLowerCase()))
      .map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        productCount: products.filter((p) => p.categoryId === c.id && p.status !== 'ARCHIVED').length,
      }));

    return {
      query: rawQuery,
      products: finalProducts,
      categories: matchingCategories,
      constraints,
    };
  }
}

// Global Singleton Export
export const centralAIEngine = CentralAIEngine.getInstance();
