import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

type Chapter = { number: number; title?: string; volume?: number; releasedAt?: string };
const VOLUME_SIZE = 10;

function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon);
}

function toSingle(v?: string | string[]) {
  return Array.isArray(v) ? v[0] : v;
}

function makePublicUrl(path: string) {
  // kalau sudah full URL, balikin apa adanya
  if (/^https?:\/\//i.test(path)) return path;

  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // path di komik_pages kamu: "slug/chapter-1/001.jpg" (tanpa leading slash)
  return `${base}/storage/v1/object/public/manga_pages/${path.replace(/^\/+/, "")}`;
}

function getChaptersFallback(total: number): Chapter[] {
  return Array.from({ length: total }, (_, i) => ({
    number: i + 1,
    title: `Chapter ${i + 1}`,
    volume: Math.ceil((i + 1) / VOLUME_SIZE),
  }));
}

export default async function ChapterPage({
  params,
}: {
  // Next 16 / Turbopack bisa Promise
  params:
    | Promise<{ slug?: string | string[]; chapter?: string | string[] }>
    | { slug?: string | string[]; chapter?: string | string[] };
}) {
  const awaitedParams = await params; // ✅ aman untuk Promise / non-Promise
  const slugRaw = toSingle(awaitedParams?.slug);
  const chapterRaw = toSingle(awaitedParams?.chapter);

  const slug = (slugRaw ?? "").trim();
  const chNum = Number(String(chapterRaw ?? "").trim());

  if (!slug) notFound();
  if (!Number.isFinite(chNum) || chNum < 1) notFound();

  const supabase = supabaseServer();

  // 1) ambil komik by slug
  const { data: komik, error: komikErr } = await supabase
    .from("komik")
    .select("id, slug, judul_buku, chapter")
    .eq("slug", slug)
    .single();

  if (komikErr || !komik) notFound();

  // 2) ambil daftar chapter dari komik_chapters (buat total + prev/next)
  const { data: chaptersRaw } = await supabase
    .from("komik_chapters")
    .select("id, number, title, volume, released_at")
    .eq("komik_id", komik.id)
    .order("number", { ascending: true });

  const chaptersFromDb: Chapter[] = (chaptersRaw ?? []).map((ch: any) => ({
    number: Number(ch.number),
    title: ch.title ?? undefined,
    volume: ch.volume ?? undefined,
    releasedAt: ch.released_at ?? undefined,
  }));

  const total =
    (chaptersFromDb.length ? chaptersFromDb.length : Number(komik.chapter ?? 0)) || 0;

  // kalau DB chapter list kosong, fallback generate dummy chapter list dari total
  const chapters = chaptersFromDb.length ? chaptersFromDb : getChaptersFallback(total);

  if (total <= 0) notFound();
  if (chNum > total) notFound();

  const prev = chNum > 1 ? chNum - 1 : null;
  const next = chNum < total ? chNum + 1 : null;

  // 3) ambil row chapter yg diminta (buat chapter_id)
  const { data: chapterRow, error: chapterErr } = await supabase
    .from("komik_chapters")
    .select("id, number")
    .eq("komik_id", komik.id)
    .eq("number", chNum)
    .single();

  if (chapterErr || !chapterRow) {
    // kalau row chapter belum ada, ya memang tidak bisa render pages
    notFound();
  }

  // 4) ambil halaman dari komik_pages
  const { data: pagesRaw, error: pagesErr } = await supabase
    .from("komik_pages")
    .select("page_no, image_path")
    .eq("chapter_id", chapterRow.id)
    .order("page_no", { ascending: true });

  if (pagesErr) notFound();

  const pages = (pagesRaw ?? []).map((p: any) => ({
    pageNo: Number(p.page_no),
    url: makePublicUrl(String(p.image_path ?? "")),
  }));

  if (!pages.length) {
    
    notFound();
  }

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      <div className="relative mx-auto max-w-5xl px-6 py-10 md:py-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/komik/${slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-white/75 ring-1 ring-white/10 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Balik
          </Link>

          <div className="flex items-center gap-2">
            {prev ? (
              <Link
                href={`/komik/${slug}/chapter/${prev}`}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white ring-1 ring-white/15 hover:bg-white/15"
              >
                <ArrowLeft className="h-4 w-4" />
                Prev
              </Link>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-white/35 ring-1 ring-white/10">
                <ArrowLeft className="h-4 w-4" />
                Prev
              </span>
            )}

            <span className="rounded-full bg-white/5 px-4 py-2 text-sm text-white/75 ring-1 ring-white/10">
              Chapter {chNum} / {total}
            </span>

            {next ? (
              <Link
                href={`/komik/${slug}/chapter/${next}`}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white ring-1 ring-white/15 hover:bg-white/15"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-white/35 ring-1 ring-white/10">
                Next
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>

        <div className="mt-5 rounded-3xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur">
          <h1 className="text-lg font-bold text-white/90">
            {komik.judul_buku ?? "Untitled"} — Chapter {chNum}
          </h1>
          <p className="mt-1 text-xs text-white/60">
            Total halaman: <span className="text-white/80 font-semibold">{pages.length}</span>
          </p>
        </div>

        <div className="mt-6">
          {pages.map((p) => (
            <div
              key={p.pageNo}
              className="overflow-hidden bg-white/5 ring-1 ring-white/10"
            >

              <div className="relative w-full">
                <Image
                  src={p.url}
                  alt={`Page ${p.pageNo}`}
                  width={1200}
                  height={1800}
                  className="h-auto w-full object-contain"
                  unoptimized
                  loading={p.pageNo === 1 ? "eager" : "lazy"}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between">
          {prev ? (
            <Link
              href={`/komik/${slug}/chapter/${prev}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
            >
              <ArrowLeft className="h-4 w-4" />
              Prev
            </Link>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-5 py-3 text-sm font-semibold text-white/35 ring-1 ring-white/10">
              <ArrowLeft className="h-4 w-4" />
              Prev
            </span>
          )}

          <Link
            href={`/komik/${slug}`}
            className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
          >
            Detail Komik
          </Link>

          {next ? (
            <Link
              href={`/komik/${slug}/chapter/${next}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-5 py-3 text-sm font-semibold text-white/35 ring-1 ring-white/10">
              Next
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
