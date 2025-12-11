"use client";

import Link from "next/link";
import AddToCartButton from "./AddToCartButton";

type Product = {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  price: number;
  brand: string;
  category: string;
  images?: string[];
};

export default function ProductCard({ product }: { product: Product }) {
  const productId = product._id || product.id;

  return (
    <div className="border rounded-xl p-4 shadow-sm flex flex-col gap-2 hover:shadow-md transition">
      {/* Make the whole box clickable except the Add to Cart button */}
      <Link
        href={productId ? `/products/${productId}` : "#"}
        className="block"
      >
        {/* IMAGE */}
        <div className="w-full h-90 bg-gray-100 rounded-lg mb-3 overflow-hidden flex items-center justify-center">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.title}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-gray-400 text-sm">No image</span>
          )}
        </div>

        {/* BRAND */}
        <div className="text-xs text-gray-500 uppercase">
          {product.brand}
        </div>

        {/* TITLE */}
        <h2 className="font-semibold text-sm line-clamp-2">
          {product.title}
        </h2>

        {/* DESCRIPTION */}
        <p className="text-xs text-gray-500 line-clamp-2">
          {product.description}
        </p>

        {/* PRICE */}
        <div className="mt-2 font-bold text-lg">₹{product.price}</div>
      </Link>

      {/* UNIVERSAL ADD TO CART BUTTON */}
      <AddToCartButton
        productId={productId!}
        title={product.title}
        price={product.price}
        image={product.images?.[0]}
      />
    </div>
  );
}
