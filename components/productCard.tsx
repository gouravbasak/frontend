"use client";

import Link from "next/link";
import AddToCartButton from "./AddToCartButton";

export default function ProductCard({ product }: any) {
  const outOfStock = product.stock <= 0;

  return (
    <div className="border rounded-3xl shadow bg-white p-4 flex flex-col">
      <Link href={`/products/${product._id}`}>
        <img
          src={product.images?.[0] || "/placeholder.png"}
          alt={product.title}
          className="rounded-2xl w-full h-64 object-cover"
        />
      </Link>

      <div className="mt-4">
        <div className="text-sm text-gray-500 uppercase">{product.brand}</div>
        <h2 className="font-semibold">{product.title}</h2>
        <p className="text-gray-600 text-sm">{product.description}</p>

        <p className="text-xl font-bold mt-2">₹{product.price}</p>

        <div className="mt-4">
          <AddToCartButton
            productId={product._id}
            title={product.title}
            price={product.price}
            image={product.images?.[0]}
            stock={product.stock}
          />
        </div>
      </div>
    </div>
  );
}
