"use client";

import React from "react";
import toast from "react-hot-toast";
import { useCart } from "../app/context/CartContext"; // adjust path if needed

type Props = {
  productId: string;
  title: string;
  price: number;
  image?: string;
  qty?: number;
  className?: string;
};

export default function AddToCartButton({
  productId,
  title,
  price,
  image,
  qty = 1,
  className = "",
}: Props) {
  const { addItem } = useCart();

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!productId) {
      toast.error("Invalid product id");
      return;
    }

    addItem(
      {
        productId,
        title,
        price,
        image,
      },
      qty
    );

    toast.success("Added to cart");
  };

  return (
    <button
      onClick={handleAdd}
      className={`w-full sm:w-auto sm:flex-1 py-3 rounded-full bg-black text-white text-sm font-semibold hover:opacity-95 transition ${className}`}
      aria-label="Add to cart"
    >
      Add to Cart
    </button>
  );
}
