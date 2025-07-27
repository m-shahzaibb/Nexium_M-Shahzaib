"use client";

import Link from "next/link";
import { useUserSession } from "@/lib/supabase-auth";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, loading } = useUserSession();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="animate-pulse">
              <div className="h-8 w-32 bg-white/20 rounded"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-slate-900/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link
            href="/"
            className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent hover:from-purple-300 hover:via-pink-300 hover:to-blue-300 transition-all duration-300"
          >
            ✨ Recipe Generator
          </Link>

          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-gray-300 text-sm">
                Welcome,{" "}
                <span className="font-semibold text-purple-300">
                  {user.email}
                </span>
              </span>

              <div className="flex space-x-2">
                <Link
                  href="/recipes"
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-200"
                >
                  Recipes
                </Link>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
