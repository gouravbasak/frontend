"use client";

import { useState } from "react";
import toast from "react-hot-toast";

// Use NEXT_PUBLIC_API_BASE (from .env.local)
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

function getOrderApiId(order: any): string | null {
  if (!order) return null;

  if (typeof order._id === "string") return order._id;

  if (order._id && typeof order._id === "object" && (order._id.$oid || order._id.$id)) {
    return order._id.$oid || order._id.$id;
  }

  if (typeof order.orderId === "string") return order.orderId;

  return null;
}

export default function OrderViewClient({ order }: { order: any }) {
  if (!order) {
    return <p className="text-red-600 font-semibold">Failed to load order details.</p>;
  }

  const apiId = getOrderApiId(order);
  const initialStatus = (order.status as string) || "Pending";

  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);

  const updateStatus = async (nextStatus?: string) => {
    const finalStatus = nextStatus ?? status;

    if (!apiId) {
      toast.error("Order ID missing — cannot update");
      return;
    }

    setSaving(true);
    try {
      // FIXED: Removed localhost → replaced with API_BASE
      const res = await fetch(
        `${API_BASE}/api/orders/${encodeURIComponent(apiId)}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // required for admin cookie auth
          body: JSON.stringify({ status: finalStatus }),
        }
      );

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(result?.message || "Failed to update status");
        setSaving(false);
        return;
      }

      setStatus(result?.status ?? finalStatus);
      toast.success("Order status updated");
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">
        Order {order.orderId || order._id?.$oid || order._id}
      </h1>

      {/* Customer / Shipping / Payment */}
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
            {order.billing?.city || ""} {order.billing?.state || ""}{" "}
            {order.billing?.zip || ""}
            <br />
            {order.billing?.country || ""}
          </div>
        </div>

        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Payment</div>
          <div className="font-medium">{order.payment?.brand || "—"}</div>
          <div className="text-xs">•••• {order.payment?.last4 || "—"}</div>
        </div>
      </div>

      {/* Order items */}
      <div className="p-4 border rounded">
        <div className="text-sm text-gray-500 mb-2">Items</div>
        <div className="space-y-2">
          {(order.items || []).map((it: any) => (
            <div
              key={it.productId || it._id || it.title}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <img
                  src={it.image || "/placeholder.png"}
                  className="w-12 h-12 rounded object-cover"
                />
                <div>
                  <div className="font-medium text-sm">{it.title}</div>
                  <div className="text-xs text-gray-500">
                    {it.qty} × ₹{it.price}
                  </div>
                </div>
              </div>
              <div className="font-semibold">₹{it.qty * it.price}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Status update */}
      <div className="flex items-center gap-3">
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
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
