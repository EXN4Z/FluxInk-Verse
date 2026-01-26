import type React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Eye, ArrowLeft, Star, BookOpen, Calendar } from "lucide-react";

import { COMICS, ComicItem, formatCompactID, formatDateID } from "@/lib/comics";
import ChapterList from "./ChapterList";

type Chapter = {
  number: number;
  title?: string;
  volume?: number;
  releasedAt?: string;
};

const VOLUME_SIZE = 10;

function getChapters(comic: ComicItem): Chapter[] {
  const maybe = (comic as ComicItem & { chapters?: Chapter[] }).chapters;
  if (Array.isArray(maybe) && maybe.length) return maybe;

  const total = comic.lastChapter ?? 0;
  return Array.from({ length: total }, (_, i) => ({
    number: i + 1,
    title: `Chapter ${i + 1}`,
    volume: Math.ceil((i + 1) / VOLUME_SIZE),
  }));
}

export function generateStaticParams() {
  return COMICS.map((c) => ({ slug: c.slug }));
}

export default async function KomikDetailPage({
  params,
}: {
  // Next 16 (Turbopack) bisa kasih params sebagai Promise
  params: Promise<{ slug?: string | string[] }> | { slug?: string | string[] };
}) {
  const awaitedParams = await params; // ✅ aman walau params bukan Promise
  const raw = awaitedParams?.slug;
  const slug = Array.isArray(raw) ? raw[0] : raw;

  if (!slug) notFound();

  const key = String(slug).trim().toLowerCase();

  const comic = COMICS.find((c) => c.slug.trim().toLowerCase() === key);
  if (!comic) notFound();

  const chapters = getChapters(comic);
  const totalChapters = chapters.length || comic.lastChapter || 0;
  const totalVolumes = Math.max(1, Math.ceil(totalChapters / VOLUME_SIZE));

  const synopsis =
    (comic as ComicItem & { synopsis?: string }).synopsis?.trim() ||
    comic.note?.trim() ||
    "Belum ada sinopsis.";

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
          <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10">
              <Image
                src={comic.cover}
                alt={comic.title}
                fill
                sizes="(max-width: 1024px) 100vw, 320px"
                className="object-cover object-top"
              />
            </div>

            <div className="mt-4 grid gap-2 text-sm text-white/75">
              <Stat
                label="Views"
                value={formatCompactID(comic.views ?? 0)}
                icon={<Eye className="h-4 w-4 text-sky-400" />}
              />
              <Stat
                label="Rating"
                value={comic.rating?.toFixed(1) ?? "—"}
                icon={<Star className="h-4 w-4 text-yellow-300" />}
              />
              <Stat
                label="Update"
                value={formatDateID(comic.updatedAt)}
                icon={<Calendar className="h-4 w-4 text-white/60" />}
              />
            </div>
          </div>

          {/* Info */}
          <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur">
            <div className="flex flex-wrap gap-2">
              {comic.status ? <Badge>{comic.status}</Badge> : null}
              <Badge>{totalChapters} Chapter</Badge>
              <Badge>{totalVolumes} Volume</Badge>
            </div>

            <h1 className="mt-3 text-3xl font-extrabold md:text-4xl">{comic.title}</h1>

            <p className="text-sm text-white/65">
              Author: <span className="font-semibold text-white/85">{comic.author ?? "—"}</span>
            </p>

            {comic.tags?.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {comic.tags.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-white/55">Genre: —</p>
            )}

            <div className="mt-4 rounded-2xl bg-black/25 p-4 ring-1 ring-white/10">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white/85">
                <BookOpen className="h-4 w-4 text-white/70" />
                Sinopsis
              </div>
              <p className="text-sm leading-relaxed text-white/70">{synopsis}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={`/komik/${comic.slug}/chapter/1`}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
              >
                Baca dari Awal
              </Link>

              <Link
                href={`/komik/${comic.slug}/chapter/${totalChapters || 1}`}
                className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
              >
                Chapter Terbaru
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <ChapterList slug={comic.slug} updatedAt={comic.updatedAt} chapters={chapters} />
        </div>
      </div>
    </section>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 ring-1 ring-white/10">
      {children}
    </span>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="inline-flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className="font-semibold text-white/90">{value}</span>
    </div>
  );
}
