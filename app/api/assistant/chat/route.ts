import { NextRequest, NextResponse } from 'next/server';
import { centralAIEngine } from '@/lib/ai/engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const stream = await centralAIEngine.orchestrateShoppingAssistantStream(body);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Fatal error in Central AI Assistant route:', error);
    return NextResponse.json(
      { error: error.message || 'Assistant request failed' },
      { status: 500 }
    );
  }
}
