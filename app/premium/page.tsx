"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { supabase } from "@/lib/supabase";

export default function PremiumPage() {
  const [qrImg, setQrImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buyPremium() {
    try {
      setLoading(true);
      setError(null);

      // 1️⃣ ambil session supabase (auth user)
      const { data, error: sessErr } = await supabase.auth.getSession();
      if (sessErr || !data.session) {
        setError("Kamu belum login");
        setLoading(false);
        return;
      }

      const token = data.session.access_token;

      // 2️⃣ panggil API create payment
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
        console.error("CREATE PAYMENT ERROR:", json);
        setError(JSON.stringify(json));
        setLoading(false);
        return;
      }

      // 3️⃣ ubah qr_string jadi gambar QR
      const qrDataUrl = await QRCode.toDataURL(json.qr_string);
      setQrImg(qrDataUrl);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Premium Membership</h1>

      {!qrImg && (
        <button onClick={buyPremium} disabled={loading}>
          {loading ? "Loading..." : "Beli Premium (QRIS)"}
        </button>
      )}

      {error && (
        <p style={{ color: "red", marginTop: 12 }}>
          ERROR: {error}
        </p>
      )}

      {qrImg && (
        <div style={{ marginTop: 20 }}>
          <p>Scan QRIS ini untuk bayar:</p>
          <img src={qrImg} alt="QRIS" width={260} />
          <p style={{ fontSize: 12, marginTop: 8 }}>
            Setelah bayar, refresh halaman untuk cek status premium.
          </p>
        </div>
      )}
    </div>
  );
}
