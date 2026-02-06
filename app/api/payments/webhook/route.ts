export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const CALLBACK_TOKEN = process.env.XENDIT_CALLBACK_TOKEN!;

export async function POST(req: Request) {
  try {
    const token = req.headers.get("x-callback-token");
    if (token !== CALLBACK_TOKEN) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const payload = await req.json();
    const referenceId = payload?.reference_id;
    const status = payload?.status;

    if (referenceId && status === "COMPLETED") {
      const supabaseAdmin = getSupabaseAdmin();

      const { data } = await supabaseAdmin
        .from("payments")
        .update({ status: "paid" })
        .eq("order_id", referenceId)
        .select("user_id")
        .single();

      if (data?.user_id) {
        await supabaseAdmin
          .from("profiles")
          .update({
            is_premium: true,
            premium_since: new Date().toISOString(),
          })
          .eq("id", data.user_id);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
