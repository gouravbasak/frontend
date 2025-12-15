"use client";

import React, { useEffect, useMemo, useState } from "react";

type Product = {
  _id?: string;
  id?: string;
  title: string;
  price: number;
  stock?: number;
  images?: string[];
};

type OrderItem = {
  productId: string;
  title: string;
  price: number;
  qty: number;
  image?: string | null;
};

type Order = {
  _id?: string;
  orderId?: string;
  items: OrderItem[];
  subtotal: number;
  discount?: number;
  shipping?: number;
  total: number;
  status?: string;
  createdAt?: string;
  billing?: any;
  payment?: any;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export default function AdminDashboardClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`${API_BASE}/api/products`).then((r) =>
        r.ok ? r.json() : Promise.reject(r)
      ),
      fetch(`${API_BASE}/api/orders`).then((r) =>
        r.ok ? r.json() : Promise.reject(r)
      ),
    ])
      .then(([productsData, ordersData]) => {
        if (!mounted) return;
        setProducts(Array.isArray(productsData) ? productsData : []);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      })
      .catch(async (err) => {
        console.error("Dashboard fetch error:", err);
        // try to extract server message
        let message = "Could not load dashboard data. Check backend.";
        try {
          if (err instanceof Response) {
            const json = await err.json().catch(() => null);
            message = json?.message || `${err.status} ${err.statusText}`;
          } else if (err?.message) {
            message = err.message;
          }
        } catch {}
        if (mounted) setError(message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // helpers
  const last30Days = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  }, []);

  const ordersLast30 = useMemo(
    () =>
      orders.filter((o) => {
        if (!o?.createdAt) return false;
        const created = new Date(o.createdAt);
        return created >= last30Days;
      }),
    [orders, last30Days]
  );

  const totalOrdersLast30 = ordersLast30.length;

  const revenueLast30 = useMemo(
    () => ordersLast30.reduce((s, o) => s + (Number(o.subtotal) || 0), 0),
    [ordersLast30]
  );

  const ordersByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of orders) {
      const st = (o.status || "Pending").toString();
      counts[st] = (counts[st] || 0) + 1;
    }
    return counts;
  }, [orders]);

  const lowStock = useMemo(
    () => products.filter((p) => typeof p.stock === "number" && p.stock < 10),
    [products]
  );

  if (loading)
    return (
      <div className="p-6">
        <div>Loading dashboard...</div>
      </div>
    );

  if (error)
    return (
      <div className="p-6">
        <div className="text-red-600 font-semibold">Could not load dashboard data.</div>
        <div className="text-sm text-gray-600 mt-2">{error}</div>
      </div>
    );

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>

      {/* Top metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Orders (last 30 days)</div>
          <div className="text-2xl font-semibold">{totalOrdersLast30}</div>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Revenue (last 30 days)</div>
          <div className="text-2xl font-semibold">₹{revenueLast30.toLocaleString("en-IN")}</div>
        </div>

        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Low stock (below 10)</div>
          <div className="text-2xl font-semibold">{lowStock.length}</div>
        </div>
      </div>

      {/* Orders by status + low stock list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded shadow col-span-2">
          <div className="text-sm text-gray-500 mb-2">Orders by status</div>
          <div className="flex gap-4 flex-wrap">
            {Object.keys(ordersByStatus).length === 0 && (
              <div className="text-sm text-gray-500">No orders yet</div>
            )}
            {Object.entries(ordersByStatus).map(([status, count]) => (
              <div key={status} className="px-3 py-2 bg-gray-100 rounded">
                <div className="text-xs text-gray-500">{status}</div>
                <div className="font-semibold">{count}</div>
              </div>
            ))}
          </div>

          {/* Quick recent orders table (first 6) */}
          <div className="mt-4">
            <div className="text-sm text-gray-500 mb-2">Recent orders</div>
            <div className="w-full overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500">
                    <th className="py-2 pr-4">Order</th>
                    <th className="py-2 pr-4">Items</th>
                    <th className="py-2 pr-4">Total</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 6).map((o) => (
                    <tr key={o._id || o.orderId} className="border-t">
                      <td className="py-3">{o.orderId || (o._id || "").toString().slice(-6)}</td>
                      <td className="py-3">{(o.items || []).length} items</td>
                      <td className="py-3">₹{(o.total || 0).toLocaleString("en-IN")}</td>
                      <td className="py-3">{o.status || "Pending"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Low stock list */}
        <div className="p-4 bg-white rounded shadow">
          <div className="text-sm text-gray-500">Low stock (stock less than 10)</div>
          <div className="mt-2 space-y-2">
            {lowStock.length === 0 && <div className="text-sm text-gray-500">No low-stock items</div>}
            {lowStock.slice(0, 3).map((p) => (
              <div key={p._id || p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                    <img src={p.images?.[0] || "/placeholder.png"} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{p.title}</div>
                    <div className="text-xs text-gray-500">Stock: {p.stock}</div>
                  </div>
                </div>
                <div>
                  <a href={`/admin/products/${p._id || p.id}`} className="text-sm text-blue-600">Edit</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
