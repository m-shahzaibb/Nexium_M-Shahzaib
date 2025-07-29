// app/login/page.tsx

"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Sparkle component for animation
  const Sparkles = () => {
    const sparkles = Array.from({ length: 50 }, (_, i) => (
      <div
        key={i}
        className="absolute animate-pulse opacity-70"
        style={{
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${2 + Math.random() * 3}s`,
        }}
      >
        <div
          className="w-1 h-1 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full animate-bounce"
          style={{
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1 + Math.random() * 2}s`,
          }}
        />
      </div>
    ));

    return (
      // The sparkles layer should always cover the full screen
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {sparkles}
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={`fall-${i}`}
            className="absolute w-2 h-2 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 rounded-full animate-fall opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-10px`,
              animationDuration: `${3 + Math.random() * 4}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    );
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`, // Ensure this path is correct for your dashboard
        },
      });

      if (error) {
        throw error;
      }
      setSent(true);
    } catch (error) {
      console.error("Error:", error);
      // IMPORTANT: Replaced alert with a more user-friendly message or modal in a real app
      // For this example, keeping it simple but noting the change
      alert("Error sending magic link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // CHANGE 1: Outer container is now relative, not fixing height or overflow.
    <div className="relative">
      {/* CHANGE 2: Fixed background gradient covering the entire viewport. */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 -z-10" />

      {/* Sparkles component is fixed over the background */}
      <Sparkles />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="bg-white/10 backdrop-blur-xl shadow-2xl rounded-3xl p-8 w-full max-w-md border border-white/20 relative overflow-hidden">
          {/* Glowing border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-blue-400/20 rounded-3xl blur-xl"></div>

          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2">
              ✨ Welcome Back ✨
            </h1>

            <p className="text-center text-gray-300 mb-8">
              Sign in to start cooking amazing recipes
            </p>

            {sent ? (
              <div className="text-center space-y-4">
                <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4">
                  <p className="text-green-300 font-medium mb-2">
                    🎉 Magic link sent!
                  </p>
                  <p className="text-gray-300">
                    Check your email to continue your culinary journey.
                  </p>
                </div>
                <button
                  onClick={() => setSent(false)}
                  className="text-purple-300 hover:text-purple-100 underline"
                >
                  Send another link
                </button>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="✉️ Enter your email"
                    className="w-full px-4 py-4 bg-white/10 backdrop-blur-md border border-white/30 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300"
                    required
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur-lg -z-10"></div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-bold py-4 rounded-2xl hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-pink-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                        Sending Magic...
                      </span>
                    ) : (
                      "🪄 Send Magic Link"
                    )}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Custom CSS for animations (moved from Sparkles component as it's global) */}
      <style jsx global>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
        .animate-fall {
          animation: fall linear infinite;
        }
      `}</style>
    </div>
  );
}
