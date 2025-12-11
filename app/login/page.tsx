"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 NEW

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("http://localhost:4000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log("Login response:", data);

    if (res.ok) {
      toast.success("Login successful!");

      // Save token + user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/");
    } else {
      toast.error(data.message || "Invalid credentials");
      // no redirect on failure
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-md overflow-hidden flex flex-col md:flex-row">
        
        {/* LEFT IMAGE */}
        <div className="hidden md:block w-1/2 bg-gray-100">
          <div className="relative h-full w-full">
            <img
              src="/login.png"
              alt="Login visual"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="w-full md:w-1/2 px-8 md:px-12 py-10 flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2">
            Welcome back!
          </h1>
          <p className="text-xs text-gray-600 mb-8">
            Enter your credentials to access your account
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/70"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password with Show/Hide */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-medium text-gray-700">
                <label>Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full border rounded-xl px-4 py-2.5 pr-20 text-sm focus:outline-none focus:ring-2 focus:ring-black/70"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-gray-500 hover:text-gray-800"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center text-xs text-gray-600">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4" />
                <span>Remember me for 30 days</span>
              </label>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className="mt-2 w-full bg-green-700 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-800 transition cursor-pointer"
            >
              Login
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* SOCIAL LOGIN */}
          <div className="flex gap-2 text-xs">
            <button className="w-full border rounded-xl py-2.5 flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer">
              <img
                src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
                className="h-5 w-5"
              />
              <span>Sign in with Google</span>
            </button>

            <button className="w-full border rounded-xl py-2.5 flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
                className="h-5 w-4"
              />
              <span>Sign in with Apple</span>
            </button>
          </div>

          {/* Footer link */}
          <p className="text-xs text-center text-gray-600 mt-4">
            Don’t have an account?{" "}
            <Link href="/signup" className="text-blue-600 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
