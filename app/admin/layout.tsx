"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch(`${API}/api/admin/logout`, {
      method: "POST",
      credentials: "include",
    });

    router.replace("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-black shadow-lg p-5 hidden md:block text-white">
        <h1 className="text-xl h-12 font-bold mb-6 border-b-1 border-solid border-white">
          Admin Panel
        </h1>

        <nav className="space-y-5 text-sm">
          <Link
            href="/admin"
            className="block bg-gray-800 p-2 rounded hover:bg-gray-700"
          >
            📊 Dashboard
          </Link>

          <Link
            href="/admin/products"
            className="block bg-gray-800 p-2 rounded hover:bg-gray-700"
          >
            📦 Products
          </Link>

          <Link
            href="/admin/orders"
            className="block bg-gray-800 p-2 rounded hover:bg-gray-700"
          >
            🧾 Orders
          </Link>

          <Link
            href="/admin/inventory"
            className="block bg-gray-800 p-2 rounded hover:bg-gray-700"
          >
            📦 Inventory
          </Link>

          <button
            onClick={handleLogout}
            className="mt-16 text-left text-red-600 hover:text-red-700"
          >
            🚪 Logout
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
