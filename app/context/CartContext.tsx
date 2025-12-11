"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
  productId: string;
  title: string;
  price: number;
  image?: string;
  qty: number;
};

type CartContextType = {
  cart: CartItem[];
  cartCount: number; // total quantity
  productCount: number; // unique items
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  updateQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "shopit_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCart(JSON.parse(raw));
    } catch {
      setCart([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {}
  }, [cart]);

  const addItem = (item: Omit<CartItem, "qty">, qty = 1) => {
    if (!item.productId) return;
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.productId === item.productId);
      if (idx >= 0) {
        // update qty (can be positive or negative)
        const copy = [...prev];
        const newQty = copy[idx].qty + qty;
        if (newQty <= 0) {
          copy.splice(idx, 1);
        } else {
          copy[idx] = { ...copy[idx], qty: newQty };
        }
        return copy;
      }
      // if qty <= 0 and item not present -> nothing to do
      if (qty <= 0) return prev;
      return [...prev, { ...item, qty }];
    });
  };

  const updateQty = (productId: string, qty: number) => {
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.productId === productId);
      if (idx < 0) return prev;
      const copy = [...prev];
      if (qty <= 0) {
        copy.splice(idx, 1);
      } else {
        copy[idx] = { ...copy[idx], qty };
      }
      return copy;
    });
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((p) => p.productId !== productId));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((s, it) => s + it.qty, 0);
  const productCount = cart.length;

  return (
    <CartContext.Provider
      value={{ cart, cartCount, productCount, addItem, updateQty, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
