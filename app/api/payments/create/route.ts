// app/api/payments/create/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY!;

function basicAuth(secretKey: string) {
  // Xendit pakai HTTP Basic auth: base64(secretKey + ":")
  return "Basic " + Buffer.from(secretKey + ":").toString("base64");
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: "Missing Bearer token" }, { status: 401 });
    }

    // Verify user dari token (pakai anon client)
    const supabase = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: userRes, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userRes?.user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const user = userRes.user;
    const body = await req.json().catch(() => ({}));
    const amount = Number(body.amount ?? 10000); // default 10rb, ganti sesukamu
    if (!Number.isFinite(amount) || amount < 1000) {
      return NextResponse.json({ error: "amount invalid (min 1000)" }, { status: 400 });
    }

    const orderId = `prem_${user.id}_${Date.now()}`;

    // Simpan payments: pending
    const { error: payInsErr } = await supabaseAdmin
      .from("payments")
      .insert({
        user_id: user.id,
        provider: "xendit",
        order_id: orderId,
        amount,
        status: "pending",
      });

    if (payInsErr) {
      return NextResponse.json({ error: payInsErr.message }, { status: 500 });
    }

    // Create QR Code (QRIS) via Xendit
    // Endpoint + header api-version sesuai help center Xendit :contentReference[oaicite:1]{index=1}
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

    const xjson = await xres.json().catch(() => ({}));

    // Simpan payload utk debug
    await supabaseAdmin
      .from("payments")
      .update({ raw_payload: xjson })
      .eq("order_id", orderId);

    if (!xres.ok) {
      return NextResponse.json(
        { error: "Xendit create QR failed", detail: xjson },
        { status: 502 }
      );
    }

    return NextResponse.json({
      order_id: orderId,
      amount,
      qr_string: xjson.qr_string,
      xendit_qr_id: xjson.id,
      status: xjson.status,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
