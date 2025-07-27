import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase"; // if using Supabase types

export const createClient = () =>
  createServerComponentClient<Database>({ cookies });
