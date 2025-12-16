"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

type Product = {
  _id: string;
  title: string;
  price: number;        // selling price
  mrp?: number;
  actualCost?: number;  // buying cost
  category: string;
  brand: string;
  images?: string[];
};

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/products`, {
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err?.message || `Status ${res.status}`);
      }

      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`${API}/api/admin/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.message || "Failed to delete");
        return;
      }

      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p._id !== id));
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
          className="px-4 py-2 bg-blue-300 text-black rounded-md"
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
              <tr className="bg-gray-100 text-center text-sm font-medium">
                <th className="p-3">Image</th>
                <th className="p-3 w-[150px]">Title</th>
                <th className="p-3">Brand</th>
                <th className="p-3">Category</th>
                <th className="p-3">MRP</th>
                <th className="p-3">Price</th>
                <th className="p-3">Actual Cost</th>
                <th className="p-3">Profit</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => {
                const profit =
                  typeof p.actualCost === "number"
                    ? p.price - p.actualCost
                    : null;

                return (
                  <tr key={p._id} className="border-t text-sm text-center">
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

                    <td className="p-3 text-gray-500">
                      {p.mrp ? `₹${p.mrp}` : "-"}
                    </td>

                    <td className="p-3 font-semibold">₹{p.price}</td>

                    <td className="p-3 text-gray-600">
                      {p.actualCost ? `₹${p.actualCost}` : "-"}
                    </td>

                    {/* PROFIT */}
                    <td
                      className={`p-3 font-semibold ${
                        profit === null
                          ? "text-gray-400"
                          : profit >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {profit === null ? "-" : `₹${profit}`}
                    </td>

                    <td className="p-3 space-x-4">
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
