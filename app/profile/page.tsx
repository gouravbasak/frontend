"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

type Order = {
  _id: string;
  orderId: string;
  total: number;
  status: string;
  createdAt: string;
};

export default function ProfilePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Frontend user (UI purpose only)
const [user, setUser] = useState<{ name?: string; email?: string }>({});

useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    setUser(JSON.parse(storedUser));
  }
}, []);


  useEffect(() => {
    fetch(`${API}/api/orders/my`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* PROFILE INFO */}
      <section className="border rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">My Profile</h1>

        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Name:</span>{" "}
            {user?.name || "—"}
          </div>
          <div>
            <span className="font-medium">Email:</span>{" "}
            {user?.email || "—"}
          </div>
        </div>
      </section>

      {/* MY ORDERS */}
      <section className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">My Orders</h2>

        {loading && <p>Loading orders...</p>}

        {!loading && orders.length === 0 && (
          <p className="text-gray-500">You have no orders yet.</p>
        )}

        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o._id}
              className="border rounded-md p-4 flex justify-between items-center"
            >
              <div>
                <div className="font-medium">
                  Order #{o.orderId}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(o.createdAt).toLocaleDateString("en-IN")}
                </div>
                <div className="text-sm mt-1">
                  Status:{" "}
                  <span className="font-medium">{o.status}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold">
                  ₹{o.total.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
