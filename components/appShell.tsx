"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";
import PromoBar from "@/components/promoBar";

type Props = {
  children: React.ReactNode;
};

const HIDDEN_ROUTES = ["/login", "/signup", "/forgot-password"];

export default function AppShell({ children }: Props) {
  const pathname = usePathname();
  const hideChrome = HIDDEN_ROUTES.includes(pathname);

  return (
    <>
      {!hideChrome && (
        <>
          <Navbar cartCount={0} />
          <PromoBar />
        </>
      )}
      <main>{children}</main>
    </>
  );
}
