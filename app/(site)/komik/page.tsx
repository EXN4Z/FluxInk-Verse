"use client";

import Link from "next/link";
import Image from "next/image";
import { Flame, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { COMICS, ComicItem, formatCompactID, formatDateID } from "@/lib/comics";
import { supabase } from "@/lib/supabase";

const SORTS = [
  { value: "popular", label: "Paling Populer" },
  { value: "newest", label: "Terbaru Update" },
  { value: "rating", label: "Rating Tertinggi" },
  { value: "az", label: "A - Z" },
] as const;

type SortKey = (typeof SORTS)[number]["value"];

export default function KomikPage() {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string>("All");
  const [sort, setSort] = useState<SortKey>("popular");
  const [genres, setGenres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [comic, setComic] = useState<ComicItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchGenre = async () => {
      const { data, error } = await supabase.from("genre").select("id, genre");

      if (!error && data) {
        // genre sudah array → langsung flatten
        const parsed = data.flatMap((g) => (Array.isArray(g.genre) ? g.genre : []));

        // hilangkan duplikat
        const unique = [...new Set(parsed)];

        // samakan struktur dengan UI
        setGenres(
          unique.map((genre, i) => ({
            id: i,
            genre,
          }))
        );
      }

      setLoading(false);
    };

    fetchGenre();
  }, []);

  useEffect(() => {
    const getComic = async () => {
      const { data, error } = await supabase.from("komik").select("*"); // bisa juga select kolom tertentu

      if (error) {
        console.error(error);
        return;
      }

      if (data) {
        // mapping dari DB ke ComicItem supaya nama properti cocok
        const mapped: ComicItem[] = (data as any[]).map((c) => ({
          id: c.id,
          title: c.judul_buku, // map dari DB
          slug: c.slug,
          cover: c.cover_url,
          note: c.deskripsi,
          lastChapter: c.chapter,
          updatedAt: c.updated_at,
          tags: c.genre,
          author: c.author,
          status: c.status,
          rating: c.rating,
          views: c.view,
        }));

        setComic(mapped);
      }
    };

    getComic();
  }, []);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes?.user) {
        setIsAdmin(false);
        return;
      }

      const { data: profile, error: profErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userRes.user.id)
        .single();

      if (profErr) {
        console.error("Error fetch profile:", profErr);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(profile?.role === "admin");
    };

    checkAdmin();
  }, []);

  const tags = useMemo(() => {
    const set = new Set<string>();
    comic.forEach((c) => c.tags?.forEach((t) => set.add(t)));
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b, "id-ID"))];
  }, [comic]);

  const populer = useMemo(() => {
    return [...comic].sort((a, b) => (b.views ?? 0) - (a.views ?? 0)).slice(0, 6);
  }, [comic]);

  const filtered = useMemo(() => {
    let data = [...comic];

    const qq = q.trim().toLowerCase();
    if (qq) {
      data = data.filter((c) => {
        const inTitle = c.title.toLowerCase().includes(qq);
        const inAuthor = (c.author ?? "").toLowerCase().includes(qq);
        const inTags = c.tags?.some((t) => t.toLowerCase().includes(qq));
        return inTitle || inAuthor || inTags;
      });
    }

    if (tag !== "All") {
      data = data.filter((c) => c.tags?.includes(tag));
    }

    switch (sort) {
      case "newest":
        data.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case "rating":
        data.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "az":
        data.sort((a, b) => a.title.localeCompare(b.title, "id-ID"));
        break;
      default:
        data.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
        break;
    }

    return data;
  }, [q, tag, sort, comic]);

  const clearFilters = () => {
    setQ("");
    setTag("All");
    setSort("popular");
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      {/* Decorative background (biar tema nyambung sama Home) */}
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
            <Flame className="h-4 w-4 text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.7)]" />
            Explore Komik
            <span className="ml-1 text-white/50">•</span>
            <span className="text-white/60">{COMICS.length} judul</span>
          </div>

          <h1 className="text-3xl font-extrabold md:text-4xl">
            Temukan komik favoritmu di{" "}
            <span className="bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
              FluxInkVerse
            </span>
          </h1>
          <p className="max-w-2xl text-sm text-white/65">
            Cari berdasarkan judul, author, atau genre. Populer taruh di atas biar gampang buat mulai
            explore.
          </p>
        </div>

        {/* Populer di atas */}
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">🔥 Populer Saat Ini</h2>

            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  href="/insertComic"
                  className="rounded-2xl bg-white/10 px-4 py-2 text-sm text-white/85 ring-1 ring-white/10 hover:bg-white/15 transition"
                >
                  + Tambah Komik
                </Link>
              )}

              <Link href="/" className="text-sm text-white/60 hover:text-white transition">
                ← Balik ke Home
              </Link>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {populer.map((c, idx) => (
              <PopularCard key={c.id} c={c} rank={idx + 1} />
            ))}
          </div>
        </div>

        {/* Controls Explore */}
        <div className="mt-10 rounded-3xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative w-full md:max-w-lg">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari judul / author / genre…"
                className="w-full rounded-2xl bg-black/30 py-3 pl-10 pr-10 text-sm text-white/90 ring-1 ring-white/10 outline-none placeholder:text-white/40 focus:ring-white/20"
              />
              {q ? (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/5 p-1 ring-1 ring-white/10 hover:bg-white/10"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4 text-white/70" />
                </button>
              ) : null}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/60">Urutkan:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-2xl bg-black/30 px-4 py-3 text-sm text-white/80 ring-1 ring-white/10 outline-none hover:bg-black/40"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={clearFilters}
                className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/80 ring-1 ring-white/10 hover:bg-white/15"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Tags filter */}
          <div className="mt-4 flex flex-wrap gap-2">
            {loading && <span className="text-xs text-white/50">Loading genre...</span>}

            {!loading &&
              genres.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setTag(g.genre)}
                  className={`rounded-full px-3 py-1 text-xs ring-1 transition
          ${
            tag === g.genre
              ? "bg-white text-black ring-white"
              : "bg-white/5 text-white/70 ring-white/10 hover:bg-white/10"
          }`}
                >
                  {g.genre}
                </button>
              ))}
          </div>

          <div className="mt-4 text-xs text-white/60">
            Menampilkan <span className="text-white/85 font-semibold">{filtered.length}</span> komik
            {tag !== "All" ? (
              <>
                {" "}
                untuk genre <span className="text-white/85 font-semibold">{tag}</span>
              </>
            ) : null}
            {q ? (
              <>
                {" "}
                dengan keyword <span className="text-white/85 font-semibold">“{q}”</span>
              </>
            ) : null}
            .
          </div>
        </div>

        {/* Grid semua komik */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <GridCard key={c.id} c={c} />
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-10 rounded-3xl bg-white/5 p-8 text-center ring-1 ring-white/10 backdrop-blur">
            <p className="text-sm text-white/70">Tidak ada komik yang cocok. Coba keyword lain ya.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function PopularCard({ c, rank }: { c: ComicItem; rank: number }) {
  return (
    <Link
      href={`/komik/${c.slug}`}
      className="group min-w-[280px] rounded-3xl bg-white/5 ring-1 ring-white/10 shadow-xl shadow-black/30 backdrop-blur transition hover:bg-white/[0.07]"
    >
      <div className="flex gap-4 p-4">
        <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10">
          <Image src={c.cover} alt={c.title} fill sizes="64px" className="object-cover object-top" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-orange-400/15 px-2 py-0.5 text-[11px] text-orange-200 ring-1 ring-orange-400/20">
              #{rank}
            </span>
            <p className="truncate text-sm font-semibold text-white">{c.title}</p>
          </div>

          <p className="mt-1 text-xs text-white/60">
            {c.author ? <span className="text-white/70">{c.author}</span> : null}
            {c.author ? <span className="text-white/40"> • </span> : null}
            {c.views != null ? `${formatCompactID(c.views)} views` : "Trending"}
          </p>

          <div className="mt-2 flex flex-wrap gap-1">
            {(c.tags ?? []).slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-white/55 ring-1 ring-white/10"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="h-px bg-white/10" />
      <div className="flex items-center justify-between px-4 py-3 text-xs text-white/60">
        <span>Update: {formatDateID(c.updatedAt)}</span>
        <span className="transition-transform group-hover:translate-x-0.5">→</span>
      </div>
    </Link>
  );
}

function GridCard({ c }: { c: ComicItem }) {
  return (
    <Link
      href={`/komik/${c.slug}`}
      className="group overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 shadow-xl shadow-black/30 backdrop-blur transition hover:bg-white/[0.07]"
    >
      <div className="relative h-44">
        {c.cover && c.cover.trim() !== "" ? (
          <Image src={c.cover} alt={c.title} fill sizes="64px" className="object-cover object-top" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-white/20 text-xs text-white/50">
            No Image
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 text-xs text-white/90 ring-1 ring-white/15 backdrop-blur">
          <Eye className="h-3.5 w-3.5 text-sky-400 drop-shadow-[0_0_6px_rgba(56,189,248,0.6)]" />
          {formatCompactID(c.views ?? 0)}
        </div>
      </div>

      <div className="p-4">
        <p className="truncate text-sm font-semibold text-white">{c.title}</p>
        <p className="mt-1 text-xs text-white/65 line-clamp-2">{c.note}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-white/70">
          <span className="rounded-full bg-white/5 px-2 py-0.5 ring-1 ring-white/10">
            Ch. {c.lastChapter}
          </span>
          <span className="rounded-full bg-white/5 px-2 py-0.5 ring-1 ring-white/10">
            Update: {formatDateID(c.updatedAt)}
          </span>
          {c.rating != null ? (
            <span className="rounded-full bg-white/5 px-2 py-0.5 ring-1 ring-white/10">
              ★ {c.rating.toFixed(1)}
            </span>
          ) : null}
          {c.status ? (
            <span className="rounded-full bg-white/5 px-2 py-0.5 ring-1 ring-white/10">
              {c.status}
            </span>
          ) : null}
        </div>

        {c.tags?.length ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {c.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-white/55 ring-1 ring-white/10"
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="h-px bg-white/10" />
      <div className="flex items-center justify-between px-4 py-3 text-xs text-white/60">
        <span>Detail & chapter</span>
        <span className="transition-transform group-hover:translate-x-0.5">→</span>
      </div>
    </Link>
  );
}
