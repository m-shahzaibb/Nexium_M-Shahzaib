"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "@supabase/supabase-js";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setLoading(false);
    };
    getUser();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Sparkles />
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-xl text-gray-200 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 -z-10" />
      <Sparkles />

      <div className="relative z-10 flex flex-col items-center px-4 py-16 sm:py-24">
        <div className="flex flex-col items-center justify-center mb-16 w-full max-w-2xl">
          <div className="bg-white/10 backdrop-blur-xl shadow-2xl rounded-3xl px-6 py-10 sm:px-10 sm:py-12 w-full border border-white/20 relative overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-blue-400/20 rounded-3xl blur-xl"></div>

            <div className="relative z-10">
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-6 drop-shadow-lg">
                ✨ AI Recipe Generator ✨
              </h1>

              <p className="text-lg sm:text-xl text-gray-200 mb-8 leading-relaxed">
                Transform simple ingredients into{" "}
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent font-semibold">
                  extraordinary culinary experiences
                </span>{" "}
                with the power of AI
              </p>

              {user ? (
                <div className="space-y-4">
                  <p className="text-lg text-gray-200 mb-6">
                    Welcome back,{" "}
                    <span className="font-semibold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                      {user.email || "Chef"}
                    </span>
                    !
                  </p>

                  <div className="space-y-3">
                    <Link
                      href="/recipes"
                      className="block w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all duration-300"
                    >
                      Start Cooking
                    </Link>

                    <button
                      onClick={async () => {
                        await supabase.auth.signOut();
                        router.push("/login");
                      }}
                      className="block w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all duration-300"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-lg text-gray-200 mb-6">
                    Join thousands of home chefs creating amazing meals with AI
                    assistance
                  </p>

                  <div className="space-y-3">
                    <Link
                      href="/login"
                      className="block w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg transition-all duration-300 relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/30 to-pink-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10">🪄 Get Started</span>
                    </Link>

                    <Link
                      href="/recipes"
                      className="block w-full bg-white/10 hover:bg-white/20 text-gray-200 px-8 py-4 rounded-2xl font-bold text-lg border border-white/30 hover:border-white/50 transition-all duration-300"
                    >
                      👀 Explore Recipes
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="relative z-10 max-w-4xl w-full px-4 text-center text-gray-100 space-y-16">
          {/* What We Do */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              🚀 What We Do
            </h2>
            <p className="text-lg leading-relaxed text-gray-200">
              Our AI Recipe Generator leverages advanced algorithms to transform
              your available ingredients into delicious, personalized recipes.
              Simply tell us what you have, and our AI will suggest innovative
              meal ideas, complete with cooking instructions, nutritional
              information, and ingredient substitutions.
            </p>
            <p className="text-lg leading-relaxed mt-4 text-gray-200">
              From quick weeknight dinners to gourmet feasts, we empower you to
              cook smarter, reduce food waste, and discover new culinary
              horizons with ease.
            </p>
          </div>

          {/* Why Choose Us */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-4">
              💡 Why Choose AI Recipe Generator?
            </h2>
            <ul className="text-left text-lg space-y-3 mx-auto max-w-xl">
              <li className="flex items-start">
                <span className="text-yellow-400 mr-3 text-2xl">★</span>
                <span className="text-gray-200">
                  <strong className="text-white">
                    Smart Ingredient Utilization:
                  </strong>{" "}
                  Never let food go to waste again. Our AI helps you use up
                  every last ingredient.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-3 text-2xl">★</span>
                <span className="text-gray-200">
                  <strong className="text-white">
                    Endless Culinary Inspiration:
                  </strong>{" "}
                  Break free from recipe ruts with an endless supply of creative
                  and unique meal ideas tailored for you.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-3 text-2xl">★</span>
                <span className="text-gray-200">
                  <strong className="text-white">
                    Time-Saving Convenience:
                  </strong>{" "}
                  Get instant recipe suggestions, saving you time on meal
                  planning and grocery shopping.
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-pink-400 mr-3 text-2xl">★</span>
                <span className="text-gray-200">
                  <strong className="text-white">
                    Personalized Experience:
                  </strong>{" "}
                  Whether you have dietary restrictions, preferences, or
                  specific cooking skills, our AI adapts to your needs.
                </span>
              </li>
            </ul>
          </div>

          {/* Benefits */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-lime-400 bg-clip-text text-transparent mb-4">
              🎁 Benefits You will Love
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
              <div className="flex items-center space-x-3">
                <span className="text-yellow-400 text-3xl">✓</span>
                <span className="text-gray-200">Reduced Food Waste</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-pink-400 text-3xl">✓</span>
                <span className="text-gray-200">
                  Expanded Culinary Repertoire
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-purple-400 text-3xl">✓</span>
                <span className="text-gray-200">Simplified Meal Planning</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-blue-400 text-3xl">✓</span>
                <span className="text-gray-200">Healthier Eating Habits</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-emerald-400 text-3xl">✓</span>
                <span className="text-gray-200">Cost Savings on Groceries</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-orange-400 text-3xl">✓</span>
                <span className="text-gray-200">
                  Inspiration for Every Skill Level
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

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
