"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [adminName, setAdminName] = useState("Admin");

  // get admin name
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setAdminName(user.name || "Admin");
      } catch {}
    }
  }, []);

  const handleLogout = async () => {
    await fetch(`${API}/api/admin/logout`, {
      method: "POST",
      credentials: "include",
    });

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    router.replace("/admin/login");
  };

  const linkClass = (path: string) =>
    `flex items-center gap-3 p-2 rounded transition ${
      pathname === path
        ? "bg-gray-800 text-white"
        : "text-gray-300 hover:bg-gray-800"
    }`;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-black text-white hidden md:flex flex-col pb-6">
        {/* TOP */}
        <div className="p-5 border-b border-gray-800">
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>

        {/* NAV LINKS */}
        <nav className="flex-1 p-4 space-y-2 text-sm">
          <Link href="/admin" className={linkClass("/admin")}>
            <img src="/dashboard.png" alt="" className="w-4 h-4" />
            Dashboard
          </Link>

          <Link href="/admin/products" className={linkClass("/admin/products")}>
            <img src="/products.png" alt="" className="w-4 h-4" />
            Products
          </Link>

          <Link href="/admin/orders" className={linkClass("/admin/orders")}>
            <img src="/orders.png" alt="" className="w-4 h-4" />
            Orders
          </Link>

          <Link
            href="/admin/inventory"
            className={linkClass("/admin/inventory")}
          >
            <img src="/inventory.png" alt="" className="w-4 h-4" />
            Inventory
          </Link>
        </nav>

        {/* BOTTOM USER SECTION */}
        <div className="border-t border-gray-800 p-4">
          <div className="text-xs text-gray-400 mb-1">Logged in as</div>
          <div className="text-sm font-medium mb-3 truncate">
            {adminName}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400"
          >
            <img src="/logout.png" alt="" className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
