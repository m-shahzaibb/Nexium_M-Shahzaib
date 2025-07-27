"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
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

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
        <p className="text-center text-lg text-gray-700 animate-pulse">
          Loading...
        </p>
      </div>
    );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
      <div className="bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl px-10 py-12 max-w-xl w-full border border-purple-200">
        <h1 className="text-4xl font-extrabold text-center text-purple-700 mb-4 drop-shadow-lg">
          Welcome to <span className="text-pink-500">Recipe Generator</span>
        </h1>
        <p className="text-lg text-center text-gray-700 mb-8">
          Hello,{" "}
          <span className="font-semibold text-purple-600">{user?.email}</span>!
        </p>
        <button
          className="block mx-auto mt-6 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-all duration-200"
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/login");
          }}
        >
          Logout
        </button>
        <Link
          href="/dashboard"
          className="block mx-auto mt-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg text-center transition-all duration-200"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
