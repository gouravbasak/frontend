"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export default function AdminNewProductPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    actualCost: "", // NEW
    mrp: "",        // NEW
    brand: "",
    category: "",
    images: "",
    stock: "",
  });

  const update = (key: string, val: string) =>
    setForm({ ...form, [key]: val });

  const saveProduct = async () => {
    try {
      const res = await fetch(`${API}/api/admin/products`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: Number(form.price),
          actualCost:
            form.actualCost !== "" ? Number(form.actualCost) : undefined,
          mrp: form.mrp !== "" ? Number(form.mrp) : undefined,
          brand: form.brand,
          category: form.category,
          images: form.images
            ? form.images.split(",").map((s) => s.trim())
            : [],
          stock: Number(form.stock),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast.error(err?.message || "Failed to save product");
        return;
      }

      toast.success("Product created!");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>

      <div className="space-y-4 max-w-xl">
        <input
          placeholder="Title"
          className="w-full border p-2 rounded"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="w-full border p-2 rounded"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />

        <input
          type="number"
          placeholder="Selling Price"
          className="w-full border p-2 rounded"
          value={form.price}
          onChange={(e) => update("price", e.target.value)}
        />

        {/* NEW: Actual Cost */}
        <input
          type="number"
          placeholder="Actual Cost (your buying price)"
          className="w-full border p-2 rounded"
          value={form.actualCost}
          onChange={(e) => update("actualCost", e.target.value)}
        />

        {/* NEW: MRP */}
        <input
          type="number"
          placeholder="MRP (shown to customers)"
          className="w-full border p-2 rounded"
          value={form.mrp}
          onChange={(e) => update("mrp", e.target.value)}
        />

        <input
          placeholder="Brand"
          className="w-full border p-2 rounded"
          value={form.brand}
          onChange={(e) => update("brand", e.target.value)}
        />

        <input
          placeholder="Category"
          className="w-full border p-2 rounded"
          value={form.category}
          onChange={(e) => update("category", e.target.value)}
        />

        <input
          placeholder="Image URLs (comma separated)"
          className="w-full border p-2 rounded"
          value={form.images}
          onChange={(e) => update("images", e.target.value)}
        />

        <input
          type="number"
          placeholder="Stock"
          className="w-full border p-2 rounded"
          value={form.stock}
          onChange={(e) => update("stock", e.target.value)}
        />

        <button
          onClick={saveProduct}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Save Product
        </button>
      </div>
    </div>
  );
}
