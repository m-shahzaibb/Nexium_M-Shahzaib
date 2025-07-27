// app/dashboard/page.tsx
"use client";

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      } else {
        router.push("/login");
      }
      setLoading(false);
    };
    getUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        <p className="text-lg text-gray-700 animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 px-2">
      <div className="bg-white/90 backdrop-blur-md shadow-2xl rounded-3xl px-4 py-8 sm:px-8 sm:py-12 max-w-xs sm:max-w-md md:max-w-xl w-full border border-purple-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-center text-purple-700 mb-4 drop-shadow-lg">
          Welcome,{" "}
          <span className="text-pink-500 break-all">{user?.email}</span>
        </h1>
        <Link
          href="/recipes"
          className="block mx-auto mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg text-center transition-all duration-200"
        >
          Go to Recipes
        </Link>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/login");
          }}
          className="block mx-auto mt-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-all duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
