"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/admin/login", {
        method: "POST",
        credentials: "include", // IMPORTANT: accept httpOnly cookie from server
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({ message: "Unexpected response" }));

      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }

      // success -> redirect
      router.replace(redirectTo);
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error — try again");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-xl shadow p-6"
      >
        <h2 className="text-2xl font-semibold mb-4">Admin Login</h2>

        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

        <label className="block mb-3">
          <div className="text-xs font-medium text-gray-700 mb-1">Email</div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            placeholder="admin@example.com"
            required
          />
        </label>

        <label className="block mb-4">
          <div className="text-xs font-medium text-gray-700 mb-1">Password</div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-md px-3 py-2"
            placeholder="Your admin password"
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-md font-medium disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-xs text-gray-500 mt-3">
          Use the admin credentials created by <code>scripts/createAdmin.js</code>.
        </p>
      </form>
    </div>
  );
}
    