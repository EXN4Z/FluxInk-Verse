"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { BellPlus, Loader2, Send } from "lucide-react";

type Announcement = {
  id: number;
  title: string;
  content: string;
  created_at?: string | null;
};

type Flash = { type: "success" | "error"; text: string };

export default function InsertPengumumanPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [flash, setFlash] = useState<Flash | null>(null);

  const [q, setQ] = useState("");
  const [fetching, setFetching] = useState(true);
  const [items, setItems] = useState<Announcement[]>([]);

  // ✅ admin gate (mirip InsertComic)
  useEffect(() => {
    const checkAcc = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/");
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (roleError || !roleData) {
        router.push("/");
        return;
      }

      if (roleData.role === "admin") {
        setAuthorized(true);
      } else {
        router.push("/");
      }
    };

    checkAcc();
  }, [router]);

  // fetch list pengumuman (biar admin bisa lihat apa yg udah dipost)
  useEffect(() => {
    const fetchAnnouncements = async () => {
      setFetching(true);
      const { data, error } = await supabase
        .from("pengumuman")
        .select("id, title, content, created_at")
        .order("created_at", { ascending: false });

      if (!error && data) setItems(data as Announcement[]);
      setFetching(false);
    };

    fetchAnnouncements();
  }, []);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return items;
    return items.filter((a) => {
      const inTitle = (a.title ?? "").toLowerCase().includes(qq);
      const inBody = (a.content ?? "").toLowerCase().includes(qq);
      return inTitle || inBody;
    });
  }, [q, items]);

  const resetForm = () => {
    setTitle("");
    setContent("");
  };

  const handleSubmit = async () => {
    setFlash(null);

    if (!title.trim() || !content.trim()) {
      setFlash({ type: "error", text: "Judul dan isi pengumuman wajib diisi." });
      return;
    }

    setLoading(true);

    try {
      const { data: newRow, error } = await supabase
        .from("pengumuman")
        .insert({
          title: title.trim(),
          content: content.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      setItems((prev) => [newRow as Announcement, ...prev]);
      resetForm();
      setFlash({ type: "success", text: "Pengumuman berhasil dipost ✅" });
    } catch (err: any) {
      console.error(err);
      setFlash({ type: "error", text: err?.message ?? "Terjadi error saat menyimpan." });
    } finally {
      setLoading(false);
    }
  };

  if (!authorized) return null;

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-120px] left-1/3 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(transparent_1px,rgba(255,255,255,0.04)_1px)] [background-size:18px_18px] opacity-40" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-12 md:py-16">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 ring-1 ring-white/15 backdrop-blur">
            <BellPlus className="h-4 w-4 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.55)]" />
            Add Pengumuman
            <span className="ml-1 text-white/50">•</span>
            <span className="text-white/60">Khusus admin</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-extrabold md:text-4xl">Tambah Pengumuman</h1>
              <p className="mt-1 text-sm text-white/65">Posting info update, maintenance, event, dll.</p>
            </div>

            <Link href="/pengumuman" className="text-sm text-white/60 hover:text-white transition">
              ← Ke Pengumuman
            </Link>
          </div>
        </div>

        {/* Form */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur">
            <label className="text-sm font-semibold">Judul</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Maintenance 02:00 - 03:00 WIB"
              className="mt-2 w-full rounded-2xl bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
            />

            <label className="mt-5 block text-sm font-semibold">Isi</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tulis pengumuman di sini…"
              rows={8}
              className="mt-2 w-full rounded-2xl bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
            />

            {flash ? (
              <div
                className={`mt-4 rounded-2xl px-4 py-3 text-sm ring-1 backdrop-blur ${
                  flash.type === "success"
                    ? "bg-emerald-400/10 ring-emerald-400/20 text-emerald-100"
                    : "bg-rose-400/10 ring-rose-400/20 text-rose-100"
                }`}
              >
                {flash.text}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 hover:bg-white/90 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Post Pengumuman
            </button>
          </div>

          {/* Right: List */}
          <div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Riwayat Pengumuman</h2>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari…"
                className="w-48 rounded-xl bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/40 ring-1 ring-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>

            <div className="mt-4 space-y-3">
              {fetching ? (
                <div className="text-sm text-white/60">Loading…</div>
              ) : filtered.length ? (
                filtered.map((a) => (
                  <div key={a.id} className="rounded-2xl bg-black/25 p-4 ring-1 ring-white/10">
                    <div className="text-sm font-semibold text-white">{a.title}</div>
                    <div className="mt-1 text-xs text-white/60">
                      {a.created_at ? new Date(a.created_at).toLocaleString("id-ID") : "-"}
                    </div>
                    <p className="mt-2 text-xs text-white/70 leading-relaxed overflow-hidden [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical]">
                      {a.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-sm text-white/60">Belum ada pengumuman.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
