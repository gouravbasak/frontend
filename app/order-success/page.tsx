"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Order Success page (updated)
 * - Reads order from localStorage key "lastOrder"
 * - Displays: Original subtotal (struck), Subtotal (after discount), Discount, Delivery fee, Total
 * - Download receipt button placed just below Payment Method
 * - If no order found, shows a friendly message and link to products
 *
 * Paste into: app/order-success/page.tsx
 */

type OrderItem = {
  productId: string;
  title: string;
  price: number;
  qty: number;
  image?: string | null;
};

type SavedOrder = {
  orderId: string;
  items: OrderItem[];
  originalSubtotal?: number; // pre-discount
  subtotal: number; // post-discount (what you requested)
  discount?: number;
  shipping?: number;
  total: number;
  billing?: {
    name?: string;
    line1?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    email?: string;
    phone?: string;
  };
  payment?: {
    brand?: string;
    last4?: string;
    method?: string;
  };
  createdAt?: string;
};

function formatCurrency(n = 0) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

export default function OrderSuccessPage() {
  const router = useRouter();

  // read order from localStorage
  let raw = null;
  if (typeof window !== "undefined") {
    raw = localStorage.getItem("lastOrder");
  }

  const order: SavedOrder | null = raw ? (JSON.parse(raw) as SavedOrder) : null;

  // fallback if no order
  if (!order) {
    return (
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <h1 className="text-2xl font-semibold mb-4">No order found</h1>
          <p className="text-gray-600 mb-6">
            We couldn't find your recent order. If you just placed one, please
            check that the browser allowed localStorage.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 rounded-md bg-black text-white"
            >
              Go to homepage
            </button>
            <button
              onClick={() => router.push("/products")}
              className="px-4 py-2 rounded-md border"
            >
              Browse products
            </button>
          </div>
        </div>
      </main>
    );
  }

  const items = order.items || [];
  const createdAt = order.createdAt || new Date().toISOString();
  const billing = order.billing || {};
  const payment = order.payment || {};
  const originalSubtotal = order.originalSubtotal ?? null; // may be absent
  const discountedSubtotal = order.subtotal ?? 0; // post-discount per your request
  const discount = order.discount ?? 0;
  const shipping = order.shipping ?? 0;
  const total = order.total ?? Math.max(0, discountedSubtotal + shipping);

  // Build receipt text and download
  const handleDownloadReceipt = () => {
    const lines: string[] = [];
    lines.push("Receipt");
    lines.push("==============================");
    lines.push(`Order ID: ${order.orderId}`);
    lines.push(`Date: ${new Date(createdAt).toLocaleString()}`);
    lines.push("");
    lines.push("Items:");
    for (const it of items) {
      lines.push(
        `- ${it.title} (${it.qty} x ${formatCurrency(
          it.price
        )}) = ${formatCurrency(it.qty * it.price)}`
      );
    }
    lines.push("");
    if (originalSubtotal !== null) {
      lines.push(`Original subtotal: ${formatCurrency(originalSubtotal)}`);
    }
    lines.push(
      `Subtotal (after discount): ${formatCurrency(discountedSubtotal)}`
    );
    if (discount > 0) lines.push(`Discount: -${formatCurrency(discount)}`);
    lines.push(`Delivery fee: ${formatCurrency(shipping)}`);
    lines.push(`Total: ${formatCurrency(total)}`);
    lines.push("");
    lines.push("Billing address:");
    if (billing.name) lines.push(billing.name);
    if (billing.line1) lines.push(billing.line1);
    if (billing.city || billing.state || billing.zip) {
      lines.push(
        `${billing.city || ""} ${billing.state || ""} ${
          billing.zip || ""
        }`.trim()
      );
    }
    if (billing.country) lines.push(billing.country);
    lines.push("");
    lines.push(
      `Payment: ${payment.brand || "Card"} •••• ${payment.last4 || "----"}`
    );
    lines.push("==============================");
    lines.push("Thank you for shopping with us!");

    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt_${order.orderId || "order"}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <div id="invoice" className="bg-white rounded-xl shadow p-8">
        <h1 className="text-3xl font-bold mb-2">
          Thank you — your order is confirmed!
        </h1>
        <p className="text-gray-700 mb-6">
          Order{" "}
          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
            {order.orderId}
          </span>{" "}
          placed on {new Date(createdAt).toLocaleString()}.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: order summary box (spans 2 cols on lg) */}
          <div className="lg:col-span-2 bg-gray-50 p-6 rounded-lg">
            <div className="text-sm text-gray-500 mb-3">Order summary</div>

            <div className="space-y-3 mb-4">
              {items.map((it) => (
                <div
                  key={it.productId}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={it.image || "/placeholder.png"}
                      alt={it.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <div className="font-medium">{it.title}</div>
                      <div className="text-xs text-gray-500">
                        {it.qty} × {formatCurrency(it.price)}
                      </div>
                    </div>
                  </div>
                  <div className="font-semibold">
                    {formatCurrency(it.qty * it.price)}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t space-y-2">
              {originalSubtotal !== null && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>MRP</span>
                  <span className="line-through">
                    {formatCurrency(originalSubtotal)}
                  </span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between items-center text-sm text-red-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span>Subtotal </span>
                <span>{formatCurrency(discountedSubtotal)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Delivery fee</span>
                <span>{formatCurrency(shipping)}</span>
              </div>

              <div className="flex justify-between text-lg font-bold pt-3 border-t">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Right column: billing & payment */}
          <div className="flex flex-col gap-4">
            <div className="bg-white p-4 rounded-xl border">
              <div className="text-xs text-gray-500 mb-2">Billing address</div>
              <div className="font-medium">{billing.name || "—"}</div>
              {billing.line1 && (
                <div className="text-sm text-gray-600">{billing.line1}</div>
              )}
              {(billing.city || billing.state || billing.zip) && (
                <div className="text-sm text-gray-600">
                  {billing.city || ""} {billing.state || ""} {billing.zip || ""}
                </div>
              )}
              {billing.country && (
                <div className="text-sm text-gray-600">{billing.country}</div>
              )}
              {billing.email && (
                <div className="text-sm text-gray-600 mt-1">
                  Email: {billing.email}
                </div>
              )}
              {billing.phone && (
                <div className="text-sm text-gray-600">
                  Phone: {billing.phone}
                </div>
              )}
            </div>

            <div className="bg-white p-4 rounded-xl border">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Payment method</div>
                  <div className="font-medium mt-1">
                    {payment.brand || "Card"} •••• {payment.last4 || "----"}
                  </div>
                </div>
              </div>

              {/* Download receipt: placed directly below payment method */}
              <div className="mt-4">
                <button
                  onClick={handleDownloadReceipt}
                  className="w-full bg-green-600 text-white py-2 rounded-md font-semibold"
                >
                  Download Receipt
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              Need help? Contact support with your order number to
              buy-it@gmail.com
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
