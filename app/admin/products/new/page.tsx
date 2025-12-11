"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AdminNewProductPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    brand: "",
    category: "",
    images: "",
    stock: "",
  });

  const update = (key: string, val: string) =>
    setForm({ ...form, [key]: val });

  const saveProduct = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/admin/products", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
          images: form.images.split(",").map((s) => s.trim()),
        }),
      });

      if (!res.ok) throw new Error("Error saving product");

      toast.success("Product created!");
      router.push("/admin/products");
    } catch (err) {
      toast.error("Failed to create product");
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
          placeholder="Price"
          className="w-full border p-2 rounded"
          value={form.price}
          onChange={(e) => update("price", e.target.value)}
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
