export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY!;

function basicAuth(secretKey: string) {
  return "Basic " + Buffer.from(secretKey + ":").toString("base64");
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: "Missing Bearer token" }, { status: 401 });
    }

    const supabase = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: userRes } = await supabase.auth.getUser(token);
    if (!userRes?.user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const amount = 10000;
    const orderId = `prem_${userRes.user.id}_${Date.now()}`;

    const supabaseAdmin = getSupabaseAdmin();

    const { error: insErr } = await supabaseAdmin.from("payments").insert({
      user_id: userRes.user.id,
      provider: "xendit",
      order_id: orderId,
      amount,
      status: "pending",
    });

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    const xres = await fetch("https://api.xendit.co/qr_codes", {
      method: "POST",
      headers: {
        Authorization: basicAuth(XENDIT_SECRET_KEY),
        "Content-Type": "application/json",
        "api-version": "2022-07-31",
      },
      body: JSON.stringify({
        reference_id: orderId,
        type: "DYNAMIC",
        currency: "IDR",
        amount,
      }),
    });

    const xjson = await xres.json();

    await supabaseAdmin
      .from("payments")
      .update({ raw_payload: xjson })
      .eq("order_id", orderId);

    if (!xres.ok) {
      return NextResponse.json({ error: "Xendit error", detail: xjson }, { status: 502 });
    }

    return NextResponse.json({
      order_id: orderId,
      qr_string: xjson.qr_string,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
