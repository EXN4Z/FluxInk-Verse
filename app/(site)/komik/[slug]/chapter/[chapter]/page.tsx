import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase-server";

type PageRow = { page_no: number; image_path: string };

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }> | { slug: string; chapter: string };
}) {
  const awaitedParams = await params;

  const slug = String(awaitedParams.slug ?? "").trim().toLowerCase();
  const chNum = Number(awaitedParams.chapter);

  if (!slug) notFound();
  if (!Number.isFinite(chNum) || chNum < 1) notFound();

  // 1) ambil komik dari DB pakai slug
  const { data: komik, error: komikErr } = await supabase
    .from("komik")
    .select("id, slug, judul_buku")
    .eq("slug", slug)
    .single();

  if (komikErr || !komik) notFound();

  // tambah view komik (fire and forget)
await supabase
  .from("komik")
  .update({ view: (komik.view ?? 0) + 1 })
  .eq("id", komik.id);

  // 2) ambil chapter row dari komik_chapters
  const { data: chapterRow, error: chapterErr } = await supabase
    .from("komik_chapters")
    .select("id, number, title")
    .eq("komik_id", komik.id)
    .eq("number", chNum)
    .single();

  if (chapterErr || !chapterRow) notFound();

  // 3) ambil pages dari komik_pages
  const { data: pages, error: pagesErr } = await supabase
    .from("komik_pages")
    .select("page_no, image_path")
    .eq("chapter_id", chapterRow.id)
    .order("page_no", { ascending: true });

  if (pagesErr) notFound();

  // 4) prev/next dari daftar chapter di DB
  const { data: chapterNumbers } = await supabase
    .from("komik_chapters")
    .select("number")
    .eq("komik_id", komik.id)
    .order("number", { ascending: true });

  const nums = (chapterNumbers ?? [])
    .map((r: any) => Number(r.number))
    .filter((n) => Number.isFinite(n));

  const idx = nums.indexOf(chNum);
  const prev = idx > 0 ? nums[idx - 1] : null;
  const next = idx >= 0 && idx < nums.length - 1 ? nums[idx + 1] : null;

  const bucket = "manga_pages";

  return (
    <section className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/komik/${komik.slug}`}
            className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-white/75 ring-1 ring-white/10 hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Balik ke Detail
          </Link>

          <div className="text-sm text-white/70">
            {komik.judul_buku} • Chapter {chNum}
          </div>
        </div>

        <h1 className="mt-6 text-2xl font-extrabold">
          Chapter {chNum}
          {chapterRow.title ? <span className="text-white/60 font-normal"> — {chapterRow.title}</span> : null}
        </h1>

        <div className="mt-6">
          {Array.isArray(pages) && pages.length ? (
            pages.map((p: PageRow) => {
              const { data } = supabase.storage.from(bucket).getPublicUrl(p.image_path);
              const url = data.publicUrl;

              return (
                <div key={p.page_no} className="overflow-hidden bg-white/5 ring-1 ring-white/10">
                  <img src={url} alt={`Page ${p.page_no}`} className="w-full h-auto" loading="lazy" />
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
              <p className="text-sm text-white/70">
                Belum ada gambar untuk chapter ini. Upload ke bucket <b>{bucket}</b> lalu isi tabel <b>komik_pages</b>.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between">
          {prev ? (
            <Link
              href={`/komik/${komik.slug}/chapter/${prev}`}
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
              href={`/komik/${komik.slug}/chapter/${next}`}
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
