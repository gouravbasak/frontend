"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../app/context/CartContext";

type NavbarProps = {
  cartCount?: number;
  onSearch?: (query: string) => void;
};

export default function Navbar({ cartCount = 0, onSearch }: NavbarProps) {
  const [search, setSearch] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const router = useRouter();

  // Get cart values from context
  const { cart } = useCart();
  const productCount = cart.length; // show number of unique products

  // Ref to the user dropdown wrapper for outside-click detection
  const userWrapperRef = useRef<HTMLDivElement | null>(null);

  // Read auth info on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      const user = JSON.parse(userStr);
      setIsLoggedIn(true);
      setUserName(user.name || null);
    } else {
      setIsLoggedIn(false);
      setUserName(null);
    }
  }, []);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleDocumentClick(e: MouseEvent) {
      // If dropdown is not open, nothing to do
      if (!showDropdown) return;

      // If click occurred outside the wrapper, close dropdown
      if (
        userWrapperRef.current &&
        !userWrapperRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setShowDropdown(false);
    }

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showDropdown]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch?.(search.trim());
  };

  // When user icon is clicked:
  // - if not logged in: navigate to /login
  // - if logged in: toggle dropdown
  const handleUserToggle = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setShowDropdown((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setIsLoggedIn(false);
    setShowDropdown(false);

    router.push("/");
  };

  return (
    <header className="w-full border-b">
      <nav className="mx-auto flex max-w-8xl items-center justify-between gap-4 px-9 py-3">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-18 items-center justify-center rounded-full bg-black text-white overflow-hidden">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex flex-1 items-center justify-end gap-4">
          {/* Search */}
          <form
            onSubmit={handleSubmit}
            className="hidden md:flex flex-1 max-w-md items-center gap-2 rounded-full border px-3 py-1.5 bg-gray-50"
          >
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-transparent text-sm outline-none"
            />
            <button
              type="submit"
              className="text-xs font-medium rounded-full border px-3 py-1 bg-black text-white"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-4">
            {/* USER ICON + DROPDOWN */}
            <div ref={userWrapperRef} className="relative">
              <button
                type="button"
                onClick={handleUserToggle}
                aria-haspopup="true"
                aria-expanded={showDropdown}
                className="flex h-9 w-9 items-center justify-center rounded-full border bg-gray-50 text-sm"
              >
                👤
              </button>

              {isLoggedIn && showDropdown && (
                <div
                  className="absolute right-0 mt-1 w-44 rounded-xl bg-white shadow-lg border text-sm p-3 z-50"
                  role="dialog"
                  aria-label="User menu"
                >
                  <p className="font-medium mb-2 text-gray-800">Hi, {userName}</p>

                  <button
                    className="w-full text-left text-red-600 font-medium hover:text-red-700 cursor-pointer"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* CART ICON */}
            <button
              type="button"
              onClick={() => router.push("/cart")}
              className="relative flex h-9 w-9 items-center justify-center rounded-full border bg-gray-50 text-sm cursor-pointer"
            >
              🛒

              {productCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                  {productCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
