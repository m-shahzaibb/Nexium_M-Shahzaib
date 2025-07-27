"use client";

import Link from "next/link";
import { useUserSession } from "@/lib/supabase-auth";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function Navbar() {
  const session = useUserSession();
  const supabase = createClientComponentClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="flex justify-between items-center p-4 border-b">
      <Link href="/" className="text-xl font-bold">
        🍽️ Recipe Generator
      </Link>
      {session ? (
        <div className="flex items-center gap-4">
          <span>{session.user.email}</span>
          <button onClick={handleLogout} className="px-3 py-1 border rounded">
            Logout
          </button>
        </div>
      ) : (
        <Link href="/login" className="px-3 py-1 border rounded">
          Login
        </Link>
      )}
    </nav>
  );
}
