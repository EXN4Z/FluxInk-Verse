"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import QRCode from "qrcode";

export default function PremiumPage() {
  const [qr, setQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function buyPremium() {
    setLoading(true);

    // 1. Ambil session user (auth)
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      alert("Kamu belum login");
      setLoading(false);
      return;
    }

    // 2. Panggil API create payment
    const res = await fetch("/api/payments/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: 10000, // harga premium
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      alert("Gagal bikin QR");
      console.error(json);
      setLoading(false);
      return;
    }

    // 3. Ubah qr_string jadi gambar
    const qrDataUrl = await QRCode.toDataURL(json.qr_string);
    setQr(qrDataUrl);
    setLoading(false);
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Premium</h1>

      {!qr && (
        <button onClick={buyPremium} disabled={loading}>
          {loading ? "Loading..." : "Beli Premium (QRIS)"}
        </button>
      )}

      {qr && (
        <div>
          <p>Scan QRIS ini untuk bayar:</p>
          <img src={qr} alt="QRIS" width={240} />
        </div>
      )}
    </div>
  );
}
