// app/login/page.tsx

"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Check your email for the magic link!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
      <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl px-10 py-12 max-w-md w-full border border-purple-200">
        <h1 className="text-3xl font-extrabold text-center text-purple-700 mb-6 drop-shadow-lg">
          Sign In
        </h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700 bg-white shadow-sm transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-200"
          >
            Send Magic Link
          </button>
        </form>
        {message && (
          <p
            className={`mt-6 text-center text-base font-medium ${
              message.startsWith("Error") ? "text-red-600" : "text-green-700"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
