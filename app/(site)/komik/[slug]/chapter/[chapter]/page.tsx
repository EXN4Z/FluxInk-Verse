import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { COMICS, ComicItem } from "@/lib/comics";

type Chapter = { number: number; title?: string; volume?: number; releasedAt?: string };
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

export default function ChapterPage({
  params,
}: {
  params: { slug: string; chapter: string };
}) {
  const comic = COMICS.find((c) => c.slug === params.slug);
  if (!comic) notFound();

  const chNum = Number(params.chapter);
  if (!Number.isFinite(chNum) || chNum < 1) notFound();

  const chapters = getChapters(comic);
  const total = chapters.length || comic.lastChapter || 0;
  if (chNum > total) notFound();

  const prev = chNum > 1 ? chNum - 1 : null;
  const next = chNum < total ? chNum + 1 : null;

  return (
    <section className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/komik/${comic.slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-white/75 ring-1 ring-white/10 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Balik ke Detail
          </Link>

          <div className="text-sm text-white/70">
            {comic.title} • Chapter {chNum}/{total}
          </div>
        </div>

        <h1 className="mt-6 text-2xl font-extrabold">
          Chapter {chNum}
        </h1>

        <div className="mt-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
          <p className="text-sm text-white/70">
            Ini masih stub. Nanti konten chapter (gambar / teks) kamu sambungin dari data/DB.
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between">
          {prev ? (
            <Link
              href={`/komik/${comic.slug}/chapter/${prev}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm text-white ring-1 ring-white/10 hover:bg-white/15"
            >
              <ArrowLeft className="h-4 w-4" />
              Prev
            </Link>
          ) : (
            <span />
          )}

          {next ? (
            <Link
              href={`/komik/${comic.slug}/chapter/${next}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm text-white ring-1 ring-white/10 hover:bg-white/15"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>
    </section>
  );
}
