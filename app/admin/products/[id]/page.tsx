"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function EditProductPage({ params }: any) {
  const router = useRouter();

  // params is a Promise → unwrap inside useEffect
  const [productId, setProductId] = useState<string | null>(null);

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 👉 unwrap params
  useEffect(() => {
    async function unwrap() {
      try {
        const p = await params; // params is promise in Next.js 15
        setProductId(p.id);
      } catch (err) {
        console.error("Param unwrap failed:", err);
      }
    }
    unwrap();
  }, [params]);

  // 👉 load product once id is available
  useEffect(() => {
    if (!productId) return;
    loadProduct(productId);
  }, [productId]);

  // ---------------------------------------------------------
  // Load product
  // ---------------------------------------------------------
  const loadProduct = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`http://localhost:4000/api/admin/products/${id}`, {
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err?.message || `Server returned ${res.status}`;
        setError(msg);
        toast.error("Failed to load product: " + msg);
        setLoading(false);
        return;
      }

      const data = await res.json();

      setForm({
        ...data,
        images: Array.isArray(data.images)
          ? data.images.join(", ")
          : data.images || "",
      });
    } catch (err) {
      console.error("loadProduct error", err);
      setError("Network or server error");
      toast.error("Network or server error");
    } finally {
      setLoading(false);
    }
  };

  // update helper
  const update = (key: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [key]: value }));

  // ---------------------------------------------------------
  // Save product
  // ---------------------------------------------------------
  const save = async () => {
    if (!productId) return;

    try {
      const res = await fetch(`http://localhost:4000/api/admin/products/${productId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
          images: form.images
            ? form.images.split(",").map((s: string) => s.trim())
            : [],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err?.message || "Failed to save");
        return;
      }

      toast.success("Product updated!");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    }
  };

  // ---------------------------------------------------------
  // UI Render
  // ---------------------------------------------------------
  if (loading) return <p>Loading...</p>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!form) return <p>No product data.</p>;

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------
  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

      <div className="space-y-4">
        <input
          className="border p-2 w-full"
          value={form.title || ""}
          onChange={(e) => update("title", e.target.value)}
          placeholder="Title"
        />

        <textarea
          className="border p-2 w-full"
          value={form.description || ""}
          onChange={(e) => update("description", e.target.value)}
          placeholder="Description"
        />

        <input
          className="border p-2 w-full"
          value={form.price || ""}
          onChange={(e) => update("price", e.target.value)}
          placeholder="Price"
          type="number"
        />

        <input
          className="border p-2 w-full"
          value={form.brand || ""}
          onChange={(e) => update("brand", e.target.value)}
          placeholder="Brand"
        />

        <input
          className="border p-2 w-full"
          value={form.category || ""}
          onChange={(e) => update("category", e.target.value)}
          placeholder="Category"
        />

        <input
          className="border p-2 w-full"
          value={form.images || ""}
          onChange={(e) => update("images", e.target.value)}
          placeholder="Images (comma separated)"
        />

        <input
          className="border p-2 w-full"
          value={form.stock || ""}
          onChange={(e) => update("stock", e.target.value)}
          placeholder="Stock"
          type="number"
        />

        <button
          onClick={save}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
