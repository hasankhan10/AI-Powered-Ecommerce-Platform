'use client';

import { create } from 'zustand';
import { toast } from '@/lib/store/useToast';

export interface CartItemData {
  id: string;
  variantId: string;
  productId: string;
  quantity: number;
  productName: string;
  productSlug: string;
  size: string | null;
  color: string | null;
  price: number;
  stock: number;
  imageUrl: string;
}

export interface CartData {
  cartId: string;
  items: CartItemData[];
  subtotal: number;
  totalCount: number;
}

export interface AddItemDetails {
  productName?: string;
  productSlug?: string;
  price?: number;
  imageUrl?: string;
  size?: string | null;
  color?: string | null;
  stock?: number;
}

interface CartStore {
  isOpen: boolean;
  cart: CartData;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  fetchCart: () => Promise<void>;
  addItem: (
    productId: string,
    variantId?: string,
    quantity?: number,
    details?: AddItemDetails
  ) => Promise<boolean>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
}

export const useCartStore = create<CartStore>((set, get) => ({
  isOpen: false,
  cart: {
    cartId: '',
    items: [],
    subtotal: 0,
    totalCount: 0,
  },
  isLoading: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  fetchCart: async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const data = await res.json();
        set({ cart: data });
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    }
  },

  addItem: async (productId: string, variantId?: string, quantity = 1, details?: AddItemDetails) => {
    // 1. INSTANT OPTIMISTIC UPDATE (0ms delay)
    const currentCart = get().cart;
    const existingIndex = currentCart.items.findIndex(
      (item) => (variantId ? item.variantId === variantId : item.productId === productId)
    );

    let updatedItems: CartItemData[];
    if (existingIndex > -1) {
      updatedItems = currentCart.items.map((item, idx) =>
        idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
      );
    } else if (details) {
      const newItem: CartItemData = {
        id: `temp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        productId,
        variantId: variantId || `var_${productId}`,
        quantity,
        productName: details.productName || 'Piece',
        productSlug: details.productSlug || '',
        size: details.size || null,
        color: details.color || null,
        price: details.price || 0,
        stock: details.stock || 99,
        imageUrl: details.imageUrl || '',
      };
      updatedItems = [newItem, ...currentCart.items];
    } else {
      updatedItems = currentCart.items;
    }

    const subtotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalCount = updatedItems.length > 0 
      ? updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      : currentCart.totalCount + quantity;

    // Immediately open drawer and render item in cart
    set({
      cart: {
        ...currentCart,
        items: updatedItems,
        subtotal,
        totalCount,
      },
      isOpen: true,
      isLoading: false,
    });

    toast.success(
      details?.productName ? `"${details.productName}" added to bag` : 'Item added to bag',
      {
        title: 'Added to Bag',
      }
    );

    // 2. BACKGROUND SERVER SYNC
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, variantId, quantity }),
      });

      if (res.ok) {
        const data = await res.json();
        set({ cart: data });
        return true;
      } else {
        // In case of error, re-sync cart
        get().fetchCart();
        return false;
      }
    } catch (err) {
      console.error('Error adding item to cart:', err);
      get().fetchCart();
      return false;
    }
  },

  updateQuantity: async (cartItemId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        return get().removeItem(cartItemId);
      }

      // Optimistic update
      const currentCart = get().cart;
      const updatedItems = currentCart.items.map((i) =>
        i.id === cartItemId ? { ...i, quantity } : i
      );
      const subtotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const totalCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      set({
        cart: {
          ...currentCart,
          items: updatedItems,
          subtotal,
          totalCount,
        },
      });

      const res = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId, quantity }),
      });

      if (res.ok) {
        const data = await res.json();
        set({ cart: data });
      }
    } catch (err) {
      console.error('Error updating cart quantity:', err);
      // Re-fetch to ensure sync
      get().fetchCart();
    }
  },

  removeItem: async (cartItemId: string) => {
    try {
      // Immediate optimistic removal from UI
      const currentCart = get().cart;
      const filteredItems = currentCart.items.filter((i) => i.id !== cartItemId);
      const subtotal = filteredItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const totalCount = filteredItems.reduce((sum, item) => sum + item.quantity, 0);
      set({
        cart: {
          ...currentCart,
          items: filteredItems,
          subtotal,
          totalCount,
        },
      });

      toast.info('Item removed from shopping bag');

      const res = await fetch(`/api/cart?cartItemId=${encodeURIComponent(cartItemId)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId }),
      });

      if (res.ok) {
        const data = await res.json();
        set({ cart: data });
      } else {
        get().fetchCart();
      }
    } catch (err) {
      console.error('Error removing item from cart:', err);
      get().fetchCart();
    }
  },
}));
