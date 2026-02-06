// lib/supabase-admin.ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-only client (punya akses bypass RLS). Jangan pernah dipakai di browser.
export const supabaseAdmin = createClient(url, serviceRole, {
  auth: { persistSession: false, autoRefreshToken: false },
});
