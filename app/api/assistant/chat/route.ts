import { NextRequest, NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { db } from '@/lib/prisma';
import { content } from '@/config/content';
import { brandConfig } from '@/config/brand.config';
import { searchStoreProducts, AssistantSearchParams } from '@/lib/assistant/search';
import { RecommendedProduct } from '@/components/assistant/AssistantProductCard';

function generateId() {
  return 'c' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages = [],
      conversationId: incomingConvId,
      sessionId = 'guest-session',
      customerId,
      productContext,
    } = body;

    const latestMessage = messages[messages.length - 1];
    const userPrompt = latestMessage?.content || '';

    // 1. Ensure or create AssistantConversation
    let conversationId = incomingConvId;
    if (!conversationId) {
      conversationId = generateId();
      try {
        await db.orm.public.AssistantConversation.create({
          id: conversationId,
          customerId: customerId || null,
          sessionId: sessionId || 'guest',
        });
      } catch (e) {
        console.warn('Could not create AssistantConversation row:', e);
      }
    }

    // Persist User Message
    if (userPrompt && conversationId) {
      try {
        await db.orm.public.AssistantMessage.create({
          id: generateId(),
          conversationId,
          role: 'user',
          content: userPrompt,
          productRefs: productContext ? JSON.stringify([productContext.id]) : null,
        });
      } catch (e) {
        console.warn('Could not persist user message:', e);
      }
    }

    // 2. Check for Google Gemini API Key
    const apiKey =
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GEMINI_API_KEY;

    const hasValidKey =
      apiKey &&
      !apiKey.includes('placeholder') &&
      !apiKey.includes('your-gemini-api-key') &&
      apiKey.trim().length > 10;

    // Track recommended products across the response
    let recommendedProducts: RecommendedProduct[] = [];

    // Helper to persist assistant message after response finishes
    const persistAssistantMessage = async (assistantText: string, products: RecommendedProduct[]) => {
      if (!conversationId) return;
      try {
        const productIds = products.map((p) => p.id);
        await db.orm.public.AssistantMessage.create({
          id: generateId(),
          conversationId,
          role: 'assistant',
          content: assistantText,
          productRefs: productIds.length > 0 ? JSON.stringify(productIds) : null,
        });
      } catch (e) {
        console.warn('Could not persist assistant message:', e);
      }
    };

    // 3. If Gemini is available, attempt real Gemini 2.5 streaming with function calling
    if (hasValidKey) {
      try {
        const google = createGoogleGenerativeAI({
          apiKey,
        });

        const systemInstruction = `${content.assistant.persona}
Brand: ${brandConfig.name} (${brandConfig.tagline}).
Catalogue Context: You have access to real-time search via the search_products tool.
Always use search_products whenever a customer asks for recommendations, outfits, styling advice, price checks, or specific pieces.
When replying to a customer's query or search:
1. Greet them warmly and acknowledge what they specifically searched for or asked about.
2. Tell them clearly: "According to your requirement, these pieces should be very good for you because..."
3. Detail the exact reasons why the selected silhouettes, fabrics (e.g. breathable linen, mulberry silk, organic cotton), and drape match their personal style or occasion.
4. Keep responses personal, warm, thoughtful, and consultative.
${
  productContext
    ? `The customer is currently viewing the piece: "${productContext.name}" (Slug: ${productContext.slug}). Offer styling pairings and complementary pieces tailored specifically to this item.`
    : ''
}`;

        const result = streamText({
          model: google('gemini-2.5-flash'),
          system: systemInstruction,
          messages: messages.map((m: any) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
          tools: {
            search_products: tool({
              description:
                'Search for in-stock products in the Maison Vale catalogue by category, price, keywords, or occasion.',
              inputSchema: z.object({
                query: z.string().optional().describe('Keywords such as linen, wedding, dress, shirt, wrap, table runner'),
                category: z.string().optional().describe('Category name or slug'),
                minPrice: z.number().optional().describe('Minimum price in INR'),
                maxPrice: z.number().optional().describe('Maximum price in INR'),
                inStockOnly: z.boolean().default(true).describe('Filter to products currently in stock'),
              }),
              execute: async (params: any) => {
                const found = await searchStoreProducts(params);
                recommendedProducts.push(...found);
                return found.map((p) => ({
                  name: p.name,
                  slug: p.slug,
                  category: p.category,
                  basePrice: p.basePrice,
                  stock: p.variants.reduce((s, v) => s + v.stock, 0),
                  colors: p.variants.map((v) => v.color).filter(Boolean),
                  sizes: p.variants.map((v) => v.size).filter(Boolean),
                }));
              },
            }),
          },
        });

        // Create an SSE stream that delivers text chunks and emits products
        const encoder = new TextEncoder();
        let fullText = '';

        const customStream = new ReadableStream({
          async start(controller) {
            try {
              for await (const chunk of result.textStream) {
                fullText += chunk;
                controller.enqueue(
                  encoder.encode(`event: delta\ndata: ${JSON.stringify({ text: chunk })}\n\n`)
                );
              }

              // Deduplicate recommended products
              const uniqueProducts = Array.from(
                new Map(recommendedProducts.map((p) => [p.id, p])).values()
              );

              if (uniqueProducts.length > 0) {
                controller.enqueue(
                  encoder.encode(`event: products\ndata: ${JSON.stringify(uniqueProducts)}\n\n`)
                );
              }

              controller.enqueue(
                encoder.encode(
                  `event: done\ndata: ${JSON.stringify({ conversationId, totalProducts: uniqueProducts.length })}\n\n`
                )
              );

              // Persist assistant message in background
              await persistAssistantMessage(fullText, uniqueProducts);
              controller.close();
            } catch (err) {
              controller.error(err);
            }
          },
        });

        return new Response(customStream, {
          headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
          },
        });
      } catch (geminiError) {
        console.warn('Gemini streaming call failed, using smart stylist fallback:', geminiError);
        // Fall through to fallback engine below
      }
    }

    // 4. Smart Stylist Fallback Engine (runs when API key is missing or call encounters quota limit)
    // Parse query for budget, category, or styling cues
    let maxPrice: number | undefined;
    const priceMatch = userPrompt.match(/(?:under|below|budget|within|up to|₹|rs\.?)\s*(\d+[\d,]*)/i);
    if (priceMatch) {
      maxPrice = parseInt(priceMatch[1].replace(/,/g, ''), 10);
    }

    let searchKeywords = userPrompt;
    if (productContext) {
      searchKeywords += ` ${productContext.name}`;
    }

    const matchedProducts = await searchStoreProducts({
      query: searchKeywords,
      maxPrice: maxPrice,
      inStockOnly: true,
    });

    // Generate warm, personalized editorial narrative
    let fallbackText = '';
    const cleanSearchQuery = userPrompt.trim();
    if (matchedProducts.length > 0) {
      if (maxPrice) {
        fallbackText = `According to your requirement under ₹${maxPrice.toLocaleString('en-IN')}, I have personally selected these pieces that should be an exceptional fit for you. Each piece below combines breathable natural fibers, relaxed tailoring, and effortless elegance:`;
      } else if (productContext) {
        fallbackText = `According to your style requirement for pairing with the ${productContext.name}, these complementary pieces will work beautifully for you to create a cohesive, elevated look:`;
      } else {
        fallbackText = `Based on what you're looking for, according to your requirement these pieces should be very good for you. Each selection highlights our signature craftsmanship, premium drape, and versatile comfort:`;
      }
    } else {
      // If no exact match with constraints, return top featured in-stock pieces
      const generalProducts = await searchStoreProducts({ inStockOnly: true });
      matchedProducts.push(...generalProducts.slice(0, 3));
      fallbackText = `According to your search for "${cleanSearchQuery}", here are signature pieces from our atelier that would be an excellent match for your personal wardrobe:`;
    }

    // Stream the fallback response smoothly to the client
    const encoder = new TextEncoder();
    const fallbackStream = new ReadableStream({
      async start(controller) {
        const words = fallbackText.split(' ');
        for (let i = 0; i < words.length; i++) {
          const chunk = (i === 0 ? '' : ' ') + words[i];
          controller.enqueue(
            encoder.encode(`event: delta\ndata: ${JSON.stringify({ text: chunk })}\n\n`)
          );
          // Subtle delay to simulate real-time typing cadence
          await new Promise((r) => setTimeout(r, 20));
        }

        controller.enqueue(
          encoder.encode(`event: products\ndata: ${JSON.stringify(matchedProducts)}\n\n`)
        );

        controller.enqueue(
          encoder.encode(
            `event: done\ndata: ${JSON.stringify({ conversationId, totalProducts: matchedProducts.length })}\n\n`
          )
        );

        await persistAssistantMessage(fallbackText, matchedProducts);
        controller.close();
      },
    });

    return new Response(fallbackStream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Fatal error in assistant route:', error);
    return NextResponse.json(
      { error: error.message || 'Assistant request failed' },
      { status: 500 }
    );
  }
}
