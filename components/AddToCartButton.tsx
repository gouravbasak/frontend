"use client";

import React, { useState } from "react";
import { useCart } from "../app/context/CartContext";
import toast from "react-hot-toast";

type Props = {
  productId: string;
  title: string;
  price: number;
  image?: string | null;
  stock?: number | null;
};

export default function AddToCartButton({
  productId,
  title,
  price,
  image,
  stock,
}: Props) {
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);

  const outOfStock = typeof stock === "number" && stock <= 0;

  const handleAdd = () => {
    if (outOfStock) {
      toast.error("Out of stock");
      return;
    }

    setLoading(true);

    addToCart({
      productId,
      title,
      price,
      image: image || "/placeholder.png",
      qty: 1,
    });

    setLoading(false);
    toast.success("Added to cart");
  };

  return (
    <button
      onClick={handleAdd}
      disabled={loading || outOfStock}
      className={`px-5 py-3 rounded-full font-semibold text-sm transition
        ${
          outOfStock
            ? "bg-gray-300 text-gray-700 cursor-not-allowed"
            : "bg-black text-white hover:bg-black/80"
        }
      `}
    >
      {loading ? "Adding…" : outOfStock ? "Out of Stock" : "Add to Cart"}
    </button>
  );
}
