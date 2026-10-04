'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  id: string;
  nome: string;
  preco: number;
  imagemUrl?: string | null;
  quantidade: number;
  estoque: number;
};

type CartState = {
  items: CartItem[];
  add: (p: Omit<CartItem, 'quantidade'>) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  total: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (p) => {
        const items = [...get().items];
        const idx = items.findIndex((i) => i.id === p.id);
        if (idx >= 0) {
          if (items[idx].quantidade < items[idx].estoque)
            items[idx].quantidade += 1;
        } else {
          items.push({ ...p, quantidade: 1 });
        }
        set({ items });
      },
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      setQty: (id, qty) =>
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantidade: Math.max(1, Math.min(qty, i.estoque)) } : i
          ),
        }),
      clear: () => set({ items: [] }),
      total: () => get().items.reduce((s, i) => s + i.preco * i.quantidade, 0),
    }),
    { name: 'lojinha-cart' }
  )
);