"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("http://localhost:4000/api/admin/logout", {
      method: "POST",
      credentials: "include",
    });

    router.replace("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-lg p-5 hidden md:block">
        <h1 className="text-xl font-bold mb-6">Admin Panel</h1>

        <nav className="space-y-3 text-sm">
          <Link href="/admin" className="block hover:text-blue-600">
            📊 Dashboard
          </Link>

          <Link href="/admin/products" className="block hover:text-blue-600">
            📦 Products
          </Link>

          <Link href="/admin/orders" className="block hover:text-blue-600">
            🧾 Orders
          </Link>

          <Link href="/admin/offers" className="block hover:text-blue-600">
            👥 offers
          </Link>

          <button
            onClick={handleLogout}
            className="mt-6 text-left text-red-600 hover:text-red-700"
          >
            🚪 Logout
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
