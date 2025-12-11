"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

type Product = {
  _id: string;
  title: string;
  price: number;
  category: string;
  brand: string;
  images?: string[];
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products
  const loadProducts = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Delete product
  const deleteProduct = async (id: string) => {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const res = await fetch(`http://localhost:4000/api/admin/products/${id}`, {
      method: "DELETE",
      credentials: "include", // VERY IMPORTANT
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      toast.error(err?.message || "Failed to delete");
      return;
    }

    toast.success("Product deleted");
    setProducts((prev) => prev.filter((p: any) => p._id !== id));
  } catch (err) {
    console.error("Delete error:", err);
    toast.error("Network error");
  }
};


  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>

        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          + Add Product
        </Link>
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-medium">
                <th className="p-3">Image</th>
                <th className="p-3">Title</th>
                <th className="p-3">Brand</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-t text-sm">
                  <td className="p-3">
                    <img
                      src={p.images?.[0] || "/placeholder.png"}
                      className="w-12 h-12 object-cover rounded"
                      alt={p.title}
                    />
                  </td>

                  <td className="p-3">{p.title}</td>
                  <td className="p-3">{p.brand}</td>
                  <td className="p-3 capitalize">{p.category}</td>
                  <td className="p-3 font-semibold">₹{p.price}</td>

                  <td className="p-3 text-right space-x-3">
                    <Link
                      href={`/admin/products/${p._id}`}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-md text-xs"
                    >
                      Edit
                    </Link>

                    <button
                      onClick={() => deleteProduct(p._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded-md text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
