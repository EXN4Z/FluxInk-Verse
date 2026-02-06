// app/api/payments/webhook/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const CALLBACK_TOKEN = process.env.XENDIT_CALLBACK_TOKEN!;

// bantu: normalisasi cari reference_id & status
function extractRefAndStatus(payload: any) {
  const reference_id =
    payload?.reference_id ||
    payload?.data?.reference_id ||
    payload?.qr_code?.reference_id ||
    payload?.payment?.reference_id;

  const status =
    payload?.status ||
    payload?.data?.status ||
    payload?.qr_code?.status ||
    payload?.payment?.status;

  return { reference_id, status };
}

function isPaidStatus(status: any) {
  const s = String(status || "").toUpperCase();
  return ["PAID", "COMPLETED", "SUCCEEDED", "SUCCESS"].includes(s);
}

export async function POST(req: Request) {
  try {
    // Verify webhook token (anti fake request)
    const token = req.headers.get("x-callback-token") || "";
    if (!CALLBACK_TOKEN || token !== CALLBACK_TOKEN) {
      return NextResponse.json({ error: "Invalid callback token" }, { status: 401 });
    }

    const payload = await req.json();

    const { reference_id, status } = extractRefAndStatus(payload);

    // simpan payload ke payments kalau bisa (biar gampang debug)
    if (reference_id) {
      await supabaseAdmin
        .from("payments")
        .update({ raw_payload: payload })
        .eq("order_id", reference_id);
    }

    if (!reference_id) {
      // tetap 200 biar Xendit gak retry terus, tapi kamu bisa lihat raw log di hosting
      return NextResponse.json({ ok: true, note: "no reference_id" }, { status: 200 });
    }

    if (isPaidStatus(status)) {
      // 1) update payment status
      const { data: payRow } = await supabaseAdmin
        .from("payments")
        .update({ status: "paid" })
        .eq("order_id", reference_id)
        .select("user_id")
        .maybeSingle();

      // 2) set user premium permanen
      if (payRow?.user_id) {
        await supabaseAdmin
          .from("profiles")
          .update({ is_premium: true, premium_since: new Date().toISOString() })
          .eq("id", payRow.user_id);
      }
    } else {
      // optional: map status lain jadi failed/expired kalau kamu mau
      // await supabaseAdmin.from("payments").update({ status: "pending" }).eq("order_id", reference_id);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    // tetep balas 200? bisa, tapi buat debug awal mending 500 biar kelihatan error di logs
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
