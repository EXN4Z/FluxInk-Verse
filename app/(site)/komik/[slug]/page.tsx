import type React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Eye, ArrowLeft, Star, BookOpen, Calendar } from "lucide-react";

import { formatCompactID, formatDateID } from "@/lib/comics";
import ChapterList from "./ChapterList";
import { supabase } from "@/lib/supabase";

type Chapter = {
  number: number;
  title?: string;
  volume?: number;
  releasedAt?: string;
};

const VOLUME_SIZE = 10;

export default async function KomikDetailPage({
  params,
}: {
  params: Promise<{ slug?: string | string[] }> | { slug?: string | string[] };
}) {
  const awaitedParams = await params;
  const raw = awaitedParams?.slug;
  const slug = Array.isArray(raw) ? raw[0] : raw;

  if (!slug) notFound();

  const key = String(slug).trim().toLowerCase();

  // 1) ambil komik dari DB (tabel: komik)
  const { data: komik, error: komikErr } = await supabase
    .from("komik")
    .select(
      "id, judul_buku, deskripsi, author, artist, cover_url, slug, view, chapter, genre, status, type, rating, created_at, updated_at"
    )
    .eq("slug", key)
    .single();

  if (komikErr || !komik) notFound();

  // 2) ambil chapters dari DB (tabel: komik_chapters)
  const { data: chapterRows, error: chErr } = await supabase
    .from("komik_chapters")
    .select("number, title, volume, released_at")
    .eq("komik_id", komik.id)
    .order("number", { ascending: true });

  if (chErr) notFound();

  // map ke format ChapterList
  const chapters: Chapter[] = (chapterRows ?? []).map((c: any) => ({
    number: Number(c.number),
    title: c.title ?? undefined,
    volume: c.volume ?? undefined,
    releasedAt: c.released_at ?? undefined,
  }));

  const totalChaptersFromDb = chapters.length;
  const fallbackTotal = Number(komik.chapter ?? 0);
  const totalChapters = totalChaptersFromDb || fallbackTotal || 0;
  const totalVolumes = Math.max(1, Math.ceil(totalChapters / VOLUME_SIZE));

  const synopsis = (komik.deskripsi ?? "").trim() || "Belum ada sinopsis.";

  const title = komik.judul_buku;
  const cover = komik.cover_url || "";
  const views = Number(komik.view ?? 0);
  const rating = komik.rating ?? null;

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      <div className="relative mx-auto max-w-7xl px-6 py-10 md:py-14">
        <Link
          href="/komik"
          className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-white/75 ring-1 ring-white/10 hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Balik ke Explore
        </Link>

        <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Cover */}
          <div className="overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10">
            <div className="relative aspect-[3/4] w-full">
              {cover ? (
                <Image
                  src={cover}
                  alt={title}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 320px"
                  priority
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-white/60">
                  No cover
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
            </div>

            <div className="p-4">
              <p className="text-lg font-extrabold">{title}</p>
              <p className="mt-1 text-xs text-white/60 line-clamp-3">{synopsis}</p>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-2xl bg-black/25 p-3 ring-1 ring-white/10">
                  <div className="flex items-center gap-2 text-white/70">
                    <Eye className="h-4 w-4" />
                    Views
                  </div>
                  <div className="mt-1 text-white font-semibold">{formatCompactID(views)}</div>
                </div>

                <div className="rounded-2xl bg-black/25 p-3 ring-1 ring-white/10">
                  <div className="flex items-center gap-2 text-white/70">
                    <Star className="h-4 w-4" />
                    Rating
                  </div>
                  <div className="mt-1 text-white font-semibold">{rating ?? "—"}</div>
                </div>

                <div className="rounded-2xl bg-black/25 p-3 ring-1 ring-white/10">
                  <div className="flex items-center gap-2 text-white/70">
                    <BookOpen className="h-4 w-4" />
                    Chapter
                  </div>
                  <div className="mt-1 text-white font-semibold">{totalChapters || 0}</div>
                </div>

                <div className="rounded-2xl bg-black/25 p-3 ring-1 ring-white/10">
                  <div className="flex items-center gap-2 text-white/70">
                    <Calendar className="h-4 w-4" />
                    Update
                  </div>
                  <div className="mt-1 text-white font-semibold">
                    {formatDateID(komik.updated_at ?? komik.created_at)}
                  </div>
                </div>
              </div>

              {Array.isArray(komik.genre) && komik.genre.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {komik.genre.slice(0, 8).map((g: string) => (
                    <span
                      key={g}
                      className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/80 ring-1 ring-white/10"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-3 text-xs text-white/60">
                <div>Author: <span className="text-white/85 font-semibold">{komik.author ?? "—"}</span></div>
                <div>Artist: <span className="text-white/85 font-semibold">{komik.artist ?? "—"}</span></div>
                <div>Status: <span className="text-white/85 font-semibold">{komik.status ?? "—"}</span></div>
                <div>Type: <span className="text-white/85 font-semibold">{komik.type ?? "—"}</span></div>
                <div>Volumes: <span className="text-white/85 font-semibold">{totalVolumes}</span></div>
              </div>
            </div>
          </div>

          {/* Chapters */}
          <div className="space-y-4">
            <ChapterList
              slug={komik.slug}
              updatedAt={komik.updated_at ?? komik.created_at}
              chapters={chapters}
            />

            {chapters.length === 0 ? (
              <div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10">
                <p className="text-sm text-white/70">
                  Belum ada chapter di tabel <span className="text-white/85">komik_chapters</span> untuk komik ini.
                  Kamu bilang mau insert manual — silakan insert dulu, nanti list ini otomatis muncul.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
