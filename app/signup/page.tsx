"use client";

import Link from "next/link";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();

    const res = await fetch("http://localhost:4000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    console.log("Signup response:", data);

    if (res.ok) {
      toast.success("Signup successful!");
      // Save token + user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Redirect to homepage
      router.push("/");
    } else {
      toast.error(data.message || "Sign up failed");

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
              alt="Signup visual"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="w-full md:w-1/2 px-8 md:px-12 py-10 flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-semibold mb-4">
            Get started now
          </h1>

          <form onSubmit={handleSignup} className="flex flex-col gap-2">
            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/70"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/70"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Terms */}
            <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
              <input type="checkbox" className="h-4 w-4" required />
              <span>I agree to terms & policy *</span>
            </div>

            {/* Sign Up button */}
            <button
              type="submit"
              className="mt-2 w-full bg-green-700 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-800 transition cursor-pointer"
            >
              Sign Up
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Social Buttons */}
          <div className="flex gap-2 text-xs">
            <button className="w-full border rounded-xl py-2.5 flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer">
              <img
                src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
                className="h-5 w-5"
                alt="Google logo"
              />
              <span>Sign up with Google</span>
            </button>
            <button className="w-full border rounded-xl py-2.5 flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
                className="h-5 w-4"
                alt="Apple logo"
              />
              <span>Sign up with Apple</span>
            </button>
          </div>

          {/* Footer */}
          <p className="text-xs text-center text-gray-600 mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
