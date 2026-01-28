"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, ArrowDownAZ, ArrowUpZA, Layers } from "lucide-react";
import { formatDateID } from "@/lib/comics";

type Chapter = {
  number: number;
  title?: string;
  volume?: number;
  releasedAt?: string;
};

const VOLUME_SIZE = 10;

export default function ChapterList({
  slug,
  updatedAt,
  chapters,
}: {
  slug: string;
  updatedAt: string;
  chapters: Chapter[];
}) {
  const [q, setQ] = useState("");
  const [order, setOrder] = useState<"newest" | "oldest">("newest");

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    let data = [...chapters];

    if (qq) {
      data = data.filter((ch) => {
        const n = String(ch.number);
        const title = (ch.title ?? "").toLowerCase();
        const v = String(ch.volume ?? Math.ceil(ch.number / VOLUME_SIZE));
        return n.includes(qq) || title.includes(qq) || `vol ${v}`.includes(qq);
      });
    }

    data.sort((a, b) => (order === "newest" ? b.number - a.number : a.number - b.number));
    return data;
  }, [chapters, q, order]);

  const grouped = useMemo(() => {
    const map = new Map<number, Chapter[]>();
    filtered.forEach((ch) => {
      const v = ch.volume ?? Math.ceil(ch.number / VOLUME_SIZE);
      if (!map.has(v)) map.set(v, []);
      map.get(v)!.push(ch);
    });

    // Volume ditampilkan descending biar “terbaru” biasanya di atas
    const entries = Array.from(map.entries()).sort((a, b) => b[0] - a[0]);

    // tiap volume, urutkan chapter sesuai order
    entries.forEach(([, list]) => {
      list.sort((a, b) => (order === "newest" ? b.number - a.number : a.number - b.number));
    });

    return entries;
  }, [filtered, order]);

  return (
    <div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Daftar Chapter</h2>
          <p className="text-xs text-white/60">
            Total: <span className="text-white/85 font-semibold">{chapters.length}</span> • Update:{" "}
            <span className="text-white/85 font-semibold">{formatDateID(updatedAt)}</span>
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari chapter / vol…"
              className="w-full rounded-2xl bg-black/30 py-2.5 pl-10 pr-3 text-sm text-white/90 ring-1 ring-white/10 outline-none placeholder:text-white/40 focus:ring-white/20"
            />
          </div>

          <button
            type="button"
            onClick={() => setOrder((p) => (p === "newest" ? "oldest" : "newest"))}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 text-sm text-white/80 ring-1 ring-white/10 hover:bg-white/15"
          >
            {order === "newest" ? <ArrowUpZA className="h-4 w-4" /> : <ArrowDownAZ className="h-4 w-4" />}
            {order === "newest" ? "Terbaru" : "Terlama"}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {grouped.map(([vol, list]) => (
          <div key={vol} className="rounded-2xl bg-black/25 ring-1 ring-white/10">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-white/85">
                <Layers className="h-4 w-4 text-white/70" />
                Volume {vol}
              </div>
              <div className="text-xs text-white/60">{list.length} chapter</div>
            </div>

            <div className="h-px bg-white/10" />

            <div className="divide-y divide-white/10">
              {list.map((ch) => (
                <Link
                  key={`${vol}-${ch.number}`}
                  href={`/komik/${slug}/chapter/${ch.number}`}
                  className="flex items-center justify-between px-4 py-3 text-sm text-white/80 hover:bg-white/[0.06]"
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold text-white">
                      Chapter {ch.number}
                      {ch.title ? <span className="text-white/60 font-normal"> — {ch.title}</span> : null}
                    </div>
                    <div className="text-xs text-white/55">
                      {ch.releasedAt ? `Rilis: ${formatDateID(ch.releasedAt)}` : "Rilis: —"}
                    </div>
                  </div>
                  <span className="text-white/50">→</span>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-black/25 p-6 text-center ring-1 ring-white/10">
            <p className="text-sm text-white/70">Chapter tidak ditemukan. Coba keyword lain.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
