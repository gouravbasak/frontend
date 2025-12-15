"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

type OrderItem = {
  productId: string;
  qty: number;
  title: string;
  price: number;
};

type AdminOrder = {
  _id: string;
  orderId: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
  status?: string;
  billing?: {
    name?: string;
    email?: string;
  };
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/orders`,
        {
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to load");

      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-gray-100 text-sm text-left font-medium">
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Items</th>
                <th className="p-3">Total</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-t text-sm">
                  <td className="p-3 font-mono">{order.orderId}</td>

                  <td className="p-3">
                    {order.billing?.name || "Guest"}
                    <div className="text-xs text-gray-500">
                      {order.billing?.email || "No email"}
                    </div>
                  </td>

                  <td className="p-3">{order.items.length} items</td>

                  <td className="p-3 font-semibold">₹{order.total}</td>

                  <td className="p-3">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        order.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.status || "pending"}
                    </span>
                  </td>

                  <td className="p-3 text-right">
                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs"
                    >
                      View
                    </Link>
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
