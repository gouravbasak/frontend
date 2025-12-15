"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type CartItem = {
  productId: string;
  title: string;
  price: number;
  qty: number;
  image?: string | null;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const exists = prev.find((p) => p.productId === item.productId);

      if (exists) {
        return prev.map((p) =>
          p.productId === item.productId ? { ...p, qty: p.qty + item.qty } : p
        );
      }

      return [...prev, item];
    });
  };

  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
