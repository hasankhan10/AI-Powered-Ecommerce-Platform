import { NextRequest, NextResponse } from 'next/server';
import {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
} from '@/lib/cart';

export async function GET() {
  const cart = await getCart();
  return NextResponse.json(cart);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, variantId, quantity } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 }
      );
    }

    const result = await addToCart(productId, variantId, quantity || 1);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    const updatedCart = await getCart();
    return NextResponse.json(updatedCart);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { cartItemId, quantity } = body;

    if (!cartItemId || typeof quantity !== 'number') {
      return NextResponse.json(
        { error: 'cartItemId and quantity are required' },
        { status: 400 }
      );
    }

    await updateCartItemQuantity(cartItemId, quantity);
    const updatedCart = await getCart();
    return NextResponse.json(updatedCart);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let cartItemId = searchParams.get('cartItemId');

    if (!cartItemId) {
      try {
        const body = await req.json();
        cartItemId = body?.cartItemId;
      } catch {
        // Ignore JSON parse errors if body is empty
      }
    }

    if (!cartItemId) {
      return NextResponse.json(
        { error: 'cartItemId query parameter or body is required' },
        { status: 400 }
      );
    }

    const removeResult = await removeCartItem(cartItemId);
    if (!removeResult.success) {
      return NextResponse.json({ error: removeResult.error }, { status: 500 });
    }

    const updatedCart = await getCart();
    return NextResponse.json(updatedCart);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}


