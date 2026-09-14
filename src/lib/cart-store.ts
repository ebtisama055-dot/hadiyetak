'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartLine } from './types';

type CartState = {
  lines: CartLine[];
  addItem: (line: CartLine) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      addItem: (line) =>
        set((state) => {
          const existing = state.lines.find((l) => l.product_id === line.product_id);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.product_id === line.product_id ? { ...l, quantity: l.quantity + line.quantity } : l
              ),
            };
          }
          return { lines: [...state.lines, line] };
        }),
      removeItem: (productId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.product_id !== productId) })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          lines: quantity <= 0
            ? state.lines.filter((l) => l.product_id !== productId)
            : state.lines.map((l) => (l.product_id === productId ? { ...l, quantity } : l)),
        })),
      clear: () => set({ lines: [] }),
      subtotal: () => get().lines.reduce((sum, l) => sum + l.unit_price * l.quantity, 0),
    }),
    { name: 'hadiyetak-cart' }
  )
);
