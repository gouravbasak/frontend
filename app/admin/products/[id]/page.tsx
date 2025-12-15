"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export default function EditProductPage({ params }: any) {
  const router = useRouter();

  // params is a Promise in Next.js App Router → unwrap inside useEffect
  const [productId, setProductId] = useState<string | null>(null);

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Unwrap params
  useEffect(() => {
    async function unwrap() {
      try {
        const p = await params;
        setProductId(p.id);
      } catch (err) {
        console.error("Param unwrap failed:", err);
      }
    }
    unwrap();
  }, [params]);

  // Load product when productId is available
  useEffect(() => {
    if (productId) loadProduct(productId);
  }, [productId]);

  // ---------------------------------------------------------
  // Load product
  // ---------------------------------------------------------
  const loadProduct = async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API}/api/admin/products/${id}`, {
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err?.message || `Server returned ${res.status}`;
        toast.error(msg);
        setError(msg);
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

  const update = (key: string, value: any) =>
    setForm((prev: any) => ({ ...prev, [key]: value }));

  // ---------------------------------------------------------
  // Save product
  // ---------------------------------------------------------
  const save = async () => {
    if (!productId) return;

    try {
      const res = await fetch(`${API}/api/admin/products/${productId}`, {
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
  // UI
  // ---------------------------------------------------------

  if (loading) return <p>Loading...</p>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!form) return <p>No product data.</p>;

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
          type="number"
          className="border p-2 w-full"
          value={form.price || ""}
          onChange={(e) => update("price", e.target.value)}
          placeholder="Price"
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
          type="number"
          className="border p-2 w-full"
          value={form.stock || ""}
          onChange={(e) => update("stock", e.target.value)}
          placeholder="Stock"
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
