'use client';

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  action?: ToastAction;
  createdAt: number;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id' | 'createdAt'>) => string;
  dismissToast: (id: string) => void;
  updateToast: (id: string, updates: Partial<Omit<ToastItem, 'id' | 'createdAt'>>) => void;
  clearAll: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = 't_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
    const newToast: ToastItem = {
      ...toast,
      id,
      duration: toast.duration ?? (toast.type === 'loading' ? 0 : 4000),
      createdAt: Date.now(),
    };

    set((state) => ({
      // Keep maximum 5 active toasts on screen
      toasts: [newToast, ...state.toasts.slice(0, 4)],
    }));

    return id;
  },
  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
  updateToast: (id, updates) => {
    set((state) => ({
      toasts: state.toasts.map((t) =>
        t.id === id
          ? {
              ...t,
              ...updates,
              duration: updates.duration ?? (updates.type === 'loading' ? 0 : 4000),
            }
          : t
      ),
    }));
  },
  clearAll: () => set({ toasts: [] }),
}));

export interface ToastOptions {
  title?: string;
  duration?: number;
  action?: ToastAction;
}

function parseOptions(opts?: string | ToastOptions): ToastOptions {
  if (!opts) return {};
  if (typeof opts === 'string') return { title: opts };
  return opts;
}

/**
 * Universal luxury toast helper usable anywhere in client components
 */
export const toast = {
  success: (message: string, options?: string | ToastOptions) => {
    const opts = parseOptions(options);
    return useToastStore.getState().addToast({
      type: 'success',
      message,
      title: opts.title,
      duration: opts.duration,
      action: opts.action,
    });
  },
  error: (message: string, options?: string | ToastOptions) => {
    const opts = parseOptions(options);
    return useToastStore.getState().addToast({
      type: 'error',
      message,
      title: opts.title || 'Action Failed',
      duration: opts.duration ?? 5000,
      action: opts.action,
    });
  },
  info: (message: string, options?: string | ToastOptions) => {
    const opts = parseOptions(options);
    return useToastStore.getState().addToast({
      type: 'info',
      message,
      title: opts.title,
      duration: opts.duration,
      action: opts.action,
    });
  },
  warning: (message: string, options?: string | ToastOptions) => {
    const opts = parseOptions(options);
    return useToastStore.getState().addToast({
      type: 'warning',
      message,
      title: opts.title || 'Notice',
      duration: opts.duration,
      action: opts.action,
    });
  },
  loading: (message: string, options?: string | ToastOptions) => {
    const opts = parseOptions(options);
    return useToastStore.getState().addToast({
      type: 'loading',
      message,
      title: opts.title,
      duration: 0, // infinite until dismissed or updated
    });
  },
  dismiss: (id: string) => {
    useToastStore.getState().dismissToast(id);
  },
  clearAll: () => {
    useToastStore.getState().clearAll();
  },
  promise: async <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: any) => string);
    }
  ): Promise<T> => {
    const id = toast.loading(messages.loading);
    try {
      const data = await promise;
      const successMsg = typeof messages.success === 'function' ? messages.success(data) : messages.success;
      useToastStore.getState().updateToast(id, {
        type: 'success',
        message: successMsg,
        duration: 4000,
      });
      return data;
    } catch (err) {
      const errorMsg = typeof messages.error === 'function' ? messages.error(err) : messages.error;
      useToastStore.getState().updateToast(id, {
        type: 'error',
        title: 'Action Failed',
        message: errorMsg,
        duration: 5000,
      });
      throw err;
    }
  },
};
