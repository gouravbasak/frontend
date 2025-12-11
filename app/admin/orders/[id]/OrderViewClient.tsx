"use client";

import { useState } from "react";
import toast from "react-hot-toast";

const API_BASE = typeof window !== "undefined" && (window as any).__NEXT_PUBLIC_API_BASE
  ? (window as any).__NEXT_PUBLIC_API_BASE
  : "http://localhost:4000"; // adjust if your backend is elsewhere

function getOrderApiId(order: any): string | null {
  if (!order) return null;

  // Common shapes:
  // 1) _id is string
  if (typeof order._id === "string") return order._id;

  // 2) _id is object like { $oid: "..." } (raw mongo export)
  if (order._id && typeof order._id === "object" && (order._id.$oid || order._id.$id)) {
    return order._id.$oid || order._id.$id;
  }

  // 3) fallback to orderId if present
  if (typeof order.orderId === "string") return order.orderId;

  return null;
}

export default function OrderViewClient({ order }: { order: any }) {
  if (!order) {
    return <p className="text-red-600 font-semibold">Failed to load order details.</p>;
  }

  const apiId = getOrderApiId(order);
  const initialStatus = (order.status as string) || "Pending";

  const [status, setStatus] = useState<string>(initialStatus);
  const [saving, setSaving] = useState(false);

  const updateStatus = async (nextStatus?: string) => {
    const finalStatus = nextStatus ?? status;

    if (!apiId) {
      toast.error("Order identifier not found (cannot update).");
      return;
    }

    setSaving(true);
    try {
      const url = `${API_BASE}/api/orders/${encodeURIComponent(apiId)}/status`;

      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // include credentials if your backend needs cookie auth:
        // credentials: "include",
        body: JSON.stringify({ status: finalStatus }),
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        const msg = (payload && payload.message) || res.statusText || `HTTP ${res.status}`;
        toast.error("Update failed: " + msg);
        setSaving(false);
        return;
      }

      // backend should return updated order — use returned status if present
      const updatedStatus = payload?.status ?? finalStatus;
      setStatus(updatedStatus);
      toast.success("Order status updated");
    } catch (err) {
      console.error("Order status update error", err);
      toast.error("Network error while updating status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Order {order.orderId || (order._id && (order._id.$oid || order._id)) || order._id}</h1>

      {/* Customer / Shipping / Payment summary (simple) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Customer</div>
          <div className="font-medium">{order.billing?.name || "—"}</div>
          <div className="text-xs">{order.billing?.email || "—"}</div>
          <div className="text-xs">{order.billing?.phone || "—"}</div>
        </div>

        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Shipping Address</div>
          <div className="text-sm">
            {order.billing?.line1 || ""} <br />
            {order.billing?.city || ""} {order.billing?.state || ""} {order.billing?.zip || ""} <br />
            {order.billing?.country || ""}
          </div>
        </div>

        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Payment</div>
          <div className="font-medium">{order.payment?.brand || "—"}</div>
          <div className="text-xs">•••• {order.payment?.last4 || "—"}</div>
        </div>
      </div>

      {/* Items */}
      <div className="p-4 border rounded">
        <div className="text-sm text-gray-500 mb-2">Items</div>
        <div className="space-y-2">
          {(order.items || []).map((it: any) => (
            <div key={it.productId || it._id || it.title} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                  <img src={it.image || "/placeholder.png"} alt={it.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="font-medium text-sm">{it.title}</div>
                  <div className="text-xs text-gray-500">{it.qty} × ₹{it.price}</div>
                </div>
              </div>
              <div className="font-semibold">₹{(it.qty || 1) * (it.price || 0)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Status selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Order status</label>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        >
          <option>Pending</option>
          <option>Processing</option>
          <option>Shipped</option>
          <option>Delivered</option>
          <option>Cancelled</option>
        </select>

        <button
          onClick={() => updateStatus(status)}
          disabled={saving}
          className="ml-2 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
