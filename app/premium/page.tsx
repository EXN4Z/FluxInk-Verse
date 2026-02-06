"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { Crown, ShieldCheck, Sparkles, Zap, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

type PremiumProfile = {
  is_premium: boolean;
  premium_since: string | null;
};

type PaymentRow = {
  id: number;
  order_id: string;
  amount: number;
  status: string;
  created_at: string;
};

function formatIDR(amount: number) {
  try {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);
  } catch {
    return `Rp ${amount}`;
  }
}

function fmtDate(s?: string | null) {
  if (!s) return "-";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID");
}

export default function PremiumPage() {
  const [userId, setUserId] = useState<string | null>(null);

  const [profile, setProfile] = useState<PremiumProfile | null>(null);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [qrImg, setQrImg] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const PRICE = 10000;

  const benefits = useMemo(
    () => [
      { icon: Sparkles, title: "Badge Premium", desc: "Role / gelar premium tampil di profile & navbar." },
      { icon: Zap, title: "Akses Prioritas", desc: "Siap untuk fitur premium selanjutnya (bookmark sync, dll)." },
      { icon: ShieldCheck, title: "Dukungan", desc: "Support lebih cepat + request judul." },
    ],
    []
  );

  const loadAll = async () => {
    setRefreshing(true);
    setError(null);

    try {
      const { data: sess } = await supabase.auth.getSession();
      const u = sess.session?.user ?? null;
      setUserId(u?.id ?? null);

      if (!u?.id) {
        setProfile(null);
        setPayments([]);
        return;
      }

      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("is_premium, premium_since")
        .eq("id", u.id)
        .maybeSingle();

      if (profErr) throw profErr;

      setProfile({
        is_premium: !!(prof as any)?.is_premium,
        premium_since: ((prof as any)?.premium_since as string | null) ?? null,
      });

      const { data: payRows } = await supabase
        .from("payments")
        .select("id, order_id, amount, status, created_at")
        .eq("user_id", u.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setPayments((payRows || []) as PaymentRow[]);
    } catch (e: any) {
      setError(e?.message || "Gagal memuat data premium.");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      // login/logout -> refresh
      loadAll();
    });

    return () => listener.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function buyPremium() {
    try {
      setCreating(true);
      setError(null);

      const { data, error: sessErr } = await supabase.auth.getSession();
      if (sessErr || !data.session) {
        setError("Kamu belum login");
        setCreating(false);
        return;
      }

      const token = data.session.access_token;

      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: PRICE }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(
          json?.error ? `${json.error}${json?.detail ? `: ${JSON.stringify(json.detail)}` : ""}` : "Gagal membuat payment."
        );
        return;
      }

      setOrderId(json.order_id);
      const qrDataUrl = await QRCode.toDataURL(json.qr_string);
      setQrImg(qrDataUrl);

      // update riwayat pending
      await loadAll();
    } catch (e: any) {
      setError(e?.message || "Unknown error");
    } finally {
      setCreating(false);
    }
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-120px] left-1/3 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(transparent_1px,rgba(255,255,255,0.04)_1px)] [background-size:18px_18px] opacity-40" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-2">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 ring-1 ring-white/15 backdrop-blur">
            <Crown className="h-4 w-4 text-amber-200" /> Premium
            <span className="ml-2 rounded-full bg-amber-200/15 px-2 py-0.5 text-amber-100 ring-1 ring-amber-200/20">
              Membership
            </span>
          </div>

          <h1 className="text-3xl font-extrabold md:text-4xl">Upgrade ke Premium</h1>
          <p className="max-w-2xl text-sm text-white/65">
            Dapatkan <span className="text-white">role/gelar Premium</span> di profile & navbar, plus akses prioritas
            untuk fitur premium selanjutnya.
          </p>
        </div>

        {/* Status bar */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur">
            <div className="text-xs text-white/60">Status akun</div>
            <div className="mt-1 text-lg font-bold">{loading ? "Loading…" : userId ? "Login" : "Belum login"}</div>
            <div className="mt-1 text-xs text-white/55">
              {userId ? "Siap checkout premium kapan saja." : "Login dulu untuk mulai pembayaran."}
            </div>
          </div>

          <div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur">
            <div className="text-xs text-white/60">Membership</div>
            <div className="mt-1 flex items-center gap-2 text-lg font-bold">
              {loading ? (
                "Loading…"
              ) : profile?.is_premium ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-200" /> Premium Aktif
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-white/70" /> Free
                </>
              )}
            </div>
            <div className="mt-1 text-xs text-white/55">
              {profile?.premium_since ? `Sejak ${fmtDate(profile.premium_since)}` : "-"}
            </div>
          </div>

          <div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs text-white/60">Refresh status</div>
                <div className="mt-1 text-sm text-white/70">Setelah bayar, klik refresh untuk cek webhook.</div>
              </div>
              <button
                type="button"
                onClick={loadAll}
                disabled={refreshing}
                className="inline-flex h-10 items-center gap-2 rounded-2xl bg-white/10 px-4 text-sm text-white/85 ring-1 ring-white/10 hover:bg-white/15 disabled:opacity-60"
              >
                <RefreshCw className={"h-4 w-4 " + (refreshing ? "animate-spin" : "")} />
                {refreshing ? "Memuat" : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-100 ring-1 ring-red-400/20">
            {error}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Pricing */}
          <div className="lg:col-span-2 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-white/85">Premium Plan</div>
                <div className="mt-1 text-3xl font-extrabold">
                  {formatIDR(PRICE)} <span className="text-base font-semibold text-white/60">/ sekali bayar</span>
                </div>
                <div className="mt-1 text-sm text-white/60">Aktif selamanya (untuk versi sekarang).</div>
              </div>

              <div className="mt-4 sm:mt-0 flex items-center gap-2">
                {!userId ? (
                  <Link
                    href="/login"
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-white px-5 text-sm font-semibold text-zinc-950 hover:bg-white/90"
                  >
                    Login dulu
                  </Link>
                ) : profile?.is_premium ? (
                  <div className="inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-400/15 px-5 text-sm font-semibold text-emerald-200 ring-1 ring-emerald-400/20">
                    Sudah Premium ✅
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={buyPremium}
                    disabled={creating}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-semibold text-zinc-950 hover:bg-white/90 disabled:opacity-60"
                  >
                    <Crown className="h-4 w-4" />
                    {creating ? "Membuat QR…" : "Beli Premium (QRIS)"}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {benefits.map((b) => (
                <div key={b.title} className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                    <b.icon className="h-4 w-4 text-white/80" />
                  </div>
                  <div className="mt-3 text-sm font-semibold">{b.title}</div>
                  <div className="mt-1 text-xs text-white/60">{b.desc}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-black/20 px-4 py-3 text-xs text-white/55 ring-1 ring-white/10">
              Pembayaran menggunakan QRIS (Xendit). Setelah pembayaran <b>COMPLETED</b>, webhook akan mengubah
              <b> profiles.is_premium</b> menjadi true.
            </div>
          </div>

          {/* History */}
          <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur">
            <div className="text-lg font-bold">Riwayat Pembayaran</div>
            <p className="mt-1 text-sm text-white/60">Terakhir 5 transaksi kamu.</p>

            <div className="mt-4 space-y-3">
              {!userId ? (
                <div className="rounded-2xl bg-black/20 px-4 py-3 text-sm text-white/60 ring-1 ring-white/10">
                  Login untuk melihat riwayat.
                </div>
              ) : payments.length ? (
                payments.map((p) => (
                  <div key={p.id} className="rounded-2xl bg-black/20 px-4 py-3 ring-1 ring-white/10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-xs text-white/55">{p.order_id}</div>
                        <div className="mt-1 text-sm font-semibold text-white/85">{formatIDR(p.amount)}</div>
                        <div className="mt-1 text-xs text-white/45">{fmtDate(p.created_at)}</div>
                      </div>
                      <div
                        className={[
                          "shrink-0 rounded-full px-3 py-1 text-xs ring-1",
                          p.status === "paid"
                            ? "bg-emerald-400/15 text-emerald-200 ring-emerald-400/20"
                            : "bg-white/10 text-white/70 ring-white/10",
                        ].join(" ")}
                      >
                        {p.status}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-black/20 px-4 py-3 text-sm text-white/60 ring-1 ring-white/10">
                  Belum ada transaksi.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* QR Modal */}
        {qrImg ? (
          <div className="fixed inset-0 z-[60]">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => {
                setQrImg(null);
                setOrderId(null);
              }}
            />

            <div className="relative mx-auto mt-16 w-[92%] max-w-lg">
              <div className="overflow-hidden rounded-3xl bg-zinc-900/75 ring-1 ring-white/10 shadow-2xl">
                <div className="border-b border-white/10 px-5 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-amber-200" />
                      <div className="text-sm font-semibold text-white/90">Scan QRIS untuk bayar</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setQrImg(null);
                        setOrderId(null);
                      }}
                      className="rounded-2xl bg-white/10 px-3 py-1.5 text-xs text-white/80 ring-1 ring-white/10 hover:bg-white/15"
                    >
                      Tutup
                    </button>
                  </div>
                  {orderId ? <div className="mt-2 text-xs text-white/55">Order: {orderId}</div> : null}
                </div>

                <div className="p-5">
                  <div className="grid place-items-center rounded-2xl bg-black/25 p-4 ring-1 ring-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrImg} alt="QRIS" width={280} height={280} className="rounded-xl" />
                  </div>

                  <div className="mt-4 rounded-2xl bg-black/20 px-4 py-3 text-xs text-white/55 ring-1 ring-white/10">
                    Setelah bayar, klik <b>Refresh</b> (di atas) atau tutup modal lalu refresh halaman untuk cek status.
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={loadAll}
                      className="inline-flex h-10 items-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-zinc-950 hover:bg-white/90"
                    >
                      <RefreshCw className="h-4 w-4" /> Refresh status
                    </button>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-white/40">Klik area gelap untuk menutup</p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
