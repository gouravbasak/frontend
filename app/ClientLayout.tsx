// app/ClientLayout.tsx
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import AppShell from "@/components/appShell";          // your public shell (navbar, promo, cart)
import AdminLayout from "../app/admin/layout";    // your admin layout (sidebar only)
import { CartProvider } from "@/app/context/CartContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      <Toaster position="top-right" />
      {isAdmin ? (
        // Admin routes: render admin layout only (no AppShell)
        <AdminLayout>{children}</AdminLayout>
      ) : (
        // Public site: preserve AppShell + CartProvider
        <CartProvider>
          <AppShell>{children}</AppShell>
        </CartProvider>
      )}
    </>
  );
}
