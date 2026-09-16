import { cookies } from 'next/headers';
import { db } from '@/lib/prisma';

const CART_COOKIE_NAME = 'mv_cart_session';

function generateId() {
  return 'c' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

export async function getOrCreateCartSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(CART_COOKIE_NAME)?.value;

  if (!sessionId) {
    sessionId = generateId();
    cookieStore.set(CART_COOKIE_NAME, sessionId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  return sessionId;
}

export async function getCart() {
  try {
    const sessionId = await getOrCreateCartSessionId();
    const carts = await db.orm.public.Cart.where({ sessionId }).all();
    let cart = carts[0];

    if (!cart) {
      cart = await db.orm.public.Cart.create({
        id: generateId(),
        sessionId,
      });
    }

    const items = await db.orm.public.CartItem.where({ cartId: cart.id }).all();
    const variants = await db.orm.public.ProductVariant.where({}).all();
    const products = await db.orm.public.Product.where({}).all();
    const images = await db.orm.public.ProductImage.where({}).all();

    const formattedItems = items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId);
      const product = products.find((p) => p.id === item.productId);
      const prodImages = images
        .filter((img) => img.productId === item.productId)
        .sort((a, b) => a.position - b.position);

      return {
        id: item.id,
        variantId: item.variantId,
        productId: item.productId,
        quantity: item.quantity,
        productName: product?.name ?? 'Product',
        productSlug: product?.slug ?? '',
        size: variant?.size ?? null,
        color: variant?.color ?? null,
        price: variant ? parseFloat(variant.price.toString()) : 0,
        stock: variant?.stock ?? 0,
        imageUrl: prodImages[0]?.url || 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80',
      };
    });

    const subtotal = formattedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalCount = formattedItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      cartId: cart.id,
      items: formattedItems,
      subtotal,
      totalCount,
    };
  } catch (error) {
    console.error('Error fetching cart:', error);
    return {
      cartId: '',
      items: [],
      subtotal: 0,
      totalCount: 0,
    };
  }
}

export async function addToCart(productId: string, variantId?: string, quantity = 1) {
  try {
    let targetVariantId = variantId;

    if (!targetVariantId) {
      const variants = await db.orm.public.ProductVariant.where({ productId }).all();
      const inStock = variants.find((v) => v.stock > 0);
      targetVariantId = inStock ? inStock.id : variants[0]?.id;
    }

    if (!targetVariantId) {
      return { success: false, error: 'No available variant for this product' };
    }

    const sessionId = await getOrCreateCartSessionId();
    const carts = await db.orm.public.Cart.where({ sessionId }).all();
    let cart = carts[0];

    if (!cart) {
      cart = await db.orm.public.Cart.create({
        id: generateId(),
        sessionId,
      });
    }

    // Check existing item
    const existingItems = await db.orm.public.CartItem.where({
      cartId: cart.id,
      variantId: targetVariantId,
    }).all();

    if (existingItems.length > 0) {
      const existing = existingItems[0];
      const newQty = existing.quantity + quantity;

      try {
        await db.orm.public.CartItem.where({ id: existing.id }).update({
          quantity: newQty,
        });
      } catch {
        try {
          await db.raw.sql`
            UPDATE "cartItem" 
            SET "quantity" = ${newQty} 
            WHERE "id" = ${existing.id}
          `;
        } catch {
          await db.raw.sql`
            UPDATE "CartItem" 
            SET "quantity" = ${newQty} 
            WHERE "id" = ${existing.id}
          `;
        }
      }
    } else {
      const newItemId = generateId();
      try {
        await db.orm.public.CartItem.create({
          id: newItemId,
          cartId: cart.id,
          variantId: targetVariantId,
          productId,
          quantity,
        });
      } catch {
        try {
          await db.raw.sql`
            INSERT INTO "cartItem" ("id", "cartId", "variantId", "productId", "quantity")
            VALUES (${newItemId}, ${cart.id}, ${targetVariantId}, ${productId}, ${quantity})
          `;
        } catch {
          await db.raw.sql`
            INSERT INTO "CartItem" ("id", "cartId", "variantId", "productId", "quantity")
            VALUES (${newItemId}, ${cart.id}, ${targetVariantId}, ${productId}, ${quantity})
          `;
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error adding to cart:', error);
    return { success: false, error: 'Failed to add item to cart' };
  }
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  try {
    if (quantity <= 0) {
      return removeCartItem(cartItemId);
    }

    try {
      await db.orm.public.CartItem.where({ id: cartItemId }).update({
        quantity,
      });
    } catch {
      try {
        await db.raw.sql`
          UPDATE "cartItem"
          SET "quantity" = ${quantity}
          WHERE "id" = ${cartItemId}
        `;
      } catch {
        await db.raw.sql`
          UPDATE "CartItem"
          SET "quantity" = ${quantity}
          WHERE "id" = ${cartItemId}
        `;
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    return { success: false, error: 'Failed to update quantity' };
  }
}

export async function removeCartItem(cartItemId: string) {
  try {
    if (!cartItemId) return { success: false, error: 'cartItemId required' };

    try {
      await db.orm.public.CartItem.where({ id: cartItemId }).delete();
    } catch (ormErr) {
      console.warn('ORM delete failed, attempting raw sql fallback:', ormErr);
      try {
        await db.raw.sql`
          DELETE FROM "cartItem"
          WHERE "id" = ${cartItemId}
        `;
      } catch {
        await db.raw.sql`
          DELETE FROM "CartItem"
          WHERE "id" = ${cartItemId}
        `;
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error removing cart item:', error);
    return { success: false, error: 'Failed to remove item' };
  }
}

export async function clearCart(cartId: string) {
  try {
    if (!cartId) return { success: false, error: 'cartId required' };

    try {
      await db.orm.public.CartItem.where({ cartId }).delete();
    } catch {
      try {
        await db.raw.sql`
          DELETE FROM "cartItem"
          WHERE "cartId" = ${cartId}
        `;
      } catch {
        await db.raw.sql`
          DELETE FROM "CartItem"
          WHERE "cartId" = ${cartId}
        `;
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return { success: false, error: 'Failed to clear cart' };
  }
}

