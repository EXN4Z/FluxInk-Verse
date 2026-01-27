// lib/supabase-server.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export const createSupabaseServer = async () => {
  // dapatkan cookies secara async
  const cookieStore = await cookies();

  const cookieMethods = {
    getAll: async () => {
      const allCookies = await cookieStore.getAll();
      return allCookies.map(c => ({ name: c.name, value: c.value }));
    },
    setAll: async (cookiesArray: { name: string; value: string }[]) => {
      cookiesArray.forEach(c =>
        cookieStore.set({ name: c.name, value: c.value, path: "/" })
      );
    },
    delete: async (name: string) => {
      cookieStore.delete(name);
    },
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieMethods }
  );
};
