"use client";

import React from "react";
import { useCart } from "../context/CartContext"; // adjust path if needed
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CartPage() {
  const { cart, cartCount, updateQty, removeItem, clearCart } = useCart();
  const router = useRouter();

  const total = cart.reduce((s, it) => s + it.price * it.qty, 0);

  const inc = (id: string) => updateQty(id, (cart.find(i=>i.productId===id)?.qty || 0) + 1);
  const dec = (id: string) => {
    const current = cart.find(i => i.productId === id)?.qty || 0;
    if (current <= 1) {
      removeItem(id);
      toast.success("Removed item");
    } else {
      updateQty(id, current - 1);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold mb-6">Your Cart</h1>

      {cart.length === 0 ? (
        <p className="text-gray-500 text-lg">Your cart is empty.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {cart.map((item) => (
            <div key={item.productId} className="flex items-center gap-4 p-4 border rounded-xl">
              <img
                src={item.image || "/placeholder.png"}
                className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                alt={item.title}
              />
              <div className="flex-1">
                <h2 className="font-semibold text-sm">{item.title}</h2>
                <p className="text-sm text-gray-600">₹{item.price}</p>

                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => dec(item.productId)}
                    className="h-7 w-7 flex items-center justify-center rounded-full border"
                  >
                    −
                  </button>

                  <span className="text-sm font-medium">{item.qty}</span>

                  <button
                    onClick={() => inc(item.productId)}
                    className="h-7 w-7 flex items-center justify-center rounded-full border"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="font-semibold">₹{item.price * item.qty}</div>
                <button
                  onClick={() => { removeItem(item.productId); toast.success("Removed"); }}
                  className="text-red-500 font-medium text-sm hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          <div className="mt-6 border-t pt-6">
            <div className="flex justify-between text-lg font-semibold">
              <span>Subtotal</span>
              <span>₹{total}</span>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => router.push("/checkout")}
                className="flex-1 bg-black text-white py-3 rounded-xl text-sm font-semibold"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={() => { clearCart(); toast.success("Cart cleared"); }}
                className="flex-1 border py-3 rounded-xl text-sm font-semibold"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
