"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { formatDateID } from "@/lib/comics";
import { Bell, Plus } from "lucide-react";

type Announcement = {
  id: number;
  title: string;
  content: string;
  created_at?: string | null;
  updated_at?: string | null;
};

export default function PengumumanPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Announcement[]>([]);

  const [isAdmin, setIsAdmin] = useState(false);

  // cek role admin (biar bisa munculin tombol “Tambah Pengumuman”)
  useEffect(() => {
    const checkRole = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (data?.role === "admin") setIsAdmin(true);
    };

    checkRole();
  }, []);

  // fetch pengumuman
  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("pengumuman")
        .select("id, title, content, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (!error && data) setItems(data as Announcement[]);
      setLoading(false);
    };

    fetchAnnouncements();
  }, []);

  const hasData = useMemo(() => items.length > 0, [items]);

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-120px] left-1/3 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(transparent_1px,rgba(255,255,255,0.04)_1px)] [background-size:18px_18px] opacity-40" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 py-12 md:py-16">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 ring-1 ring-white/15 backdrop-blur">
            <Bell className="h-4 w-4 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.55)]" />
            Pengumuman
            <span className="ml-1 text-white/50">•</span>
            <span className="text-white/60">Update & info penting</span>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-extrabold md:text-4xl">Pengumuman FluxInkVerse</h1>
              <p className="mt-1 text-sm text-white/65">Rilis fitur, jadwal maintenance, atau info event.</p>
            </div>

            {isAdmin ? (
              <Link
                href="/insertPengumuman"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-white/90 transition"
              >
                <Plus className="h-4 w-4" />
                Tambah
              </Link>
            ) : null}
          </div>
        </div>

        {/* List */}
        <div className="mt-8 space-y-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur"
              >
                <div className="h-4 w-2/3 rounded bg-white/10" />
                <div className="mt-2 h-3 w-1/3 rounded bg-white/10" />
                <div className="mt-4 h-3 w-full rounded bg-white/10" />
                <div className="mt-2 h-3 w-5/6 rounded bg-white/10" />
              </div>
            ))
          ) : hasData ? (
            items.map((a) => (
              <article
                key={a.id}
                className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-lg font-bold">{a.title}</h2>
                  <span className="text-xs text-white/60">
                    {formatDateID((a.updated_at ?? a.created_at) ?? null)}
                  </span>
                </div>

                <p className="mt-3 whitespace-pre-line text-sm text-white/70 leading-relaxed">
                  {a.content}
                </p>
              </article>
            ))
          ) : (
            <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 text-white/70">
              Belum ada pengumuman.
              {isAdmin ? (
                <>
                  {" "}
                  Tambah yang pertama lewat{" "}
                  <Link href="/insertPengumuman" className="text-white underline">
                    halaman admin
                  </Link>
                  .
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
