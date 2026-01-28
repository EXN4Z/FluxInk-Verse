"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { BookPlus, Image as ImageIcon, Loader2, Plus, Search, Tag, X } from "lucide-react";
import { useRouter } from "next/navigation";

type Comic = {
  id: number;
  judul_buku: string;
  deskripsi: string;
  cover_url: string;
  author: string;
  chapter: number;
  genre?: string[] | null;
  created_at?: string;
};

type Flash = { type: "success" | "error"; text: string };

export default function AddComic() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [author, setAuthor] = useState("");
  const [chap, setChap] = useState<number>(0);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [comics, setComics] = useState<Comic[]>([]);
  const [q, setQ] = useState("");

  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [currentGenre, setCurrentGenre] = useState("");

  const [flash, setFlash] = useState<Flash | null>(null);
  const [authorized, setAuthorized] = useState(false);


  useEffect(() => {
    const checkAcc = async () => {
      const {data: { user }, error: userError} = await supabase.auth.getUser();
      if(userError || !user) {
        router.push("/");
        return;
      }
      const {data: roleData, error: roleError} = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

      if(roleError || !roleData) {
        router.push("/")
        return;
      }
      if(roleData.role === "admin") {
        setAuthorized(true);
      } else {
        router.push("/")
      }
      setLoading(false);
    };

    checkAcc();
  }, [router]);
  // preview file
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // fetch comics
  useEffect(() => {
    const fetchComics = async () => {
      setFetching(true);
      const { data, error } = await supabase
        .from("komik")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) setComics(data as Comic[]);
      setFetching(false);
    };

    fetchComics();
  }, []);

  // fetch genres
  useEffect(() => {
    const fetchGenre = async () => {
      const { data, error } = await supabase.from("genre").select("genre");
      if (!error && data) {
        const flattened = data.flatMap((row: any) => (Array.isArray(row.genre) ? row.genre : []));
        const unique = [...new Set(flattened)];
        setGenres(unique);
      }
    };
    fetchGenre();
  }, []);

  const filteredComics = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return comics;
    return comics.filter((c) => {
      const inTitle = (c.judul_buku ?? "").toLowerCase().includes(qq);
      const inAuthor = (c.author ?? "").toLowerCase().includes(qq);
      const inGenre = (c.genre ?? []).some((g) => (g ?? "").toLowerCase().includes(qq));
      return inTitle || inAuthor || inGenre;
    });
  }, [q, comics]);

  const addGenre = (value: string) => {
    if (!value) return;
    if (selectedGenres.includes(value)) return;
    setSelectedGenres((prev) => [...prev, value]);
    setCurrentGenre("");
  };

  const removeGenre = (value: string) => {
    setSelectedGenres((prev) => prev.filter((g) => g !== value));
  };

  const resetForm = () => {
    setTitle("");
    setDesc("");
    setAuthor("");
    setChap(0);
    setFile(null);
    setSelectedGenres([]);
    setCurrentGenre("");
  };

  const handleSubmit = async () => {
    setFlash(null);

    if (!title.trim() || !file) {
      setFlash({ type: "error", text: "Judul dan gambar cover wajib diisi." });
      return;
    }

    setLoading(true);

    try {
      // 1) upload cover ke storage
      const fileName = `cover-${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("covers").upload(fileName, file, {
        upsert: true,
      });
      if (uploadError) throw uploadError;

      // 2) ambil public url
      const { data: publicData } = supabase.storage.from("covers").getPublicUrl(fileName);
      const coverUrl = publicData?.publicUrl;
      if (!coverUrl) throw new Error("Gagal mengambil public URL cover.");

      // 3) insert ke DB
      const { data: newComic, error: insertError } = await supabase
        .from("komik")
        .insert({
          judul_buku: title.trim(),
          deskripsi: desc.trim(),
          cover_url: coverUrl,
          author: author.trim(),
          chapter: chap,
          genre: selectedGenres,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setComics((prev) => [newComic as Comic, ...prev]);
      resetForm();
      setFlash({ type: "success", text: "Komik berhasil ditambahkan ✅" });
    } catch (err: any) {
      console.error(err);
      setFlash({ type: "error", text: err?.message ?? "Terjadi error saat menyimpan." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      {/* Decorative background biar nyambung sama page lain */}
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
            <BookPlus className="h-4 w-4 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.65)]" />
            Add Komik
            <span className="ml-1 text-white/50">•</span>
            <span className="text-white/60">Upload cover & detail</span>
          </div>

          <h1 className="text-3xl font-extrabold md:text-4xl">
            Tambah komik baru ke{" "}
            <span className="bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
              FluxInkVerse
            </span>
          </h1>

          <div className="flex items-center justify-between gap-3">
            <p className="max-w-2xl text-sm text-white/65">
              Isi judul, deskripsi, author, chapter, pilih genre, lalu upload cover.
            </p>

            <Link href="/komik" className="text-sm text-white/60 hover:text-white transition">
              ← Ke Explore Komik
            </Link>
          </div>
        </div>

        {/* Flash */}
        {flash ? (
          <div
            className={`mt-6 rounded-3xl px-5 py-4 ring-1 backdrop-blur ${
              flash.type === "success"
                ? "bg-emerald-400/10 ring-emerald-400/20 text-emerald-100"
                : "bg-rose-400/10 ring-rose-400/20 text-rose-100"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm">{flash.text}</p>
              <button
                type="button"
                onClick={() => setFlash(null)}
                className="rounded-full bg-white/5 p-1 ring-1 ring-white/10 hover:bg-white/10"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}

        {/* Content */}
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          {/* Form */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 shadow-xl shadow-black/30 backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Form Komik</p>
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-2xl bg-white/10 px-3 py-2 text-xs text-white/80 ring-1 ring-white/10 hover:bg-white/15"
                >
                  Reset
                </button>
              </div>

              {/* Cover preview */}
              <div className="mt-4 overflow-hidden rounded-3xl bg-black/25 ring-1 ring-white/10">
                <div className="relative aspect-[16/10] w-full">
                  {preview ? (
                    // pakai img supaya aman tanpa next/image config
                    <img src={preview} alt="Preview cover" className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center">
                      <div className="flex flex-col items-center gap-2 text-white/55">
                        <ImageIcon className="h-6 w-6" />
                        <p className="text-xs">Preview cover muncul di sini</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <Field label="Judul Komik">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: One Piece"
                    className="w-full rounded-2xl bg-black/30 px-4 py-3 text-sm text-white/90 ring-1 ring-white/10 outline-none placeholder:text-white/40 focus:ring-white/20"
                  />
                </Field>

                <Field label="Deskripsi">
                  <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Tulis deskripsi singkat…"
                    rows={4}
                    className="w-full resize-none rounded-2xl bg-black/30 px-4 py-3 text-sm text-white/90 ring-1 ring-white/10 outline-none placeholder:text-white/40 focus:ring-white/20"
                  />
                </Field>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Author">
                    <input
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Contoh: Eiichiro Oda"
                      className="w-full rounded-2xl bg-black/30 px-4 py-3 text-sm text-white/90 ring-1 ring-white/10 outline-none placeholder:text-white/40 focus:ring-white/20"
                    />
                  </Field>

                  <Field label="Chapter">
                    <input
                      type="number"
                      value={chap}
                      onChange={(e) => setChap(Number(e.target.value))}
                      min={0}
                      className="w-full rounded-2xl bg-black/30 px-4 py-3 text-sm text-white/90 ring-1 ring-white/10 outline-none focus:ring-white/20"
                    />
                  </Field>
                </div>

                {/* Genre picker */}
                <Field label="Genre">
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                      <select
                        value={currentGenre}
                        onChange={(e) => addGenre(e.target.value)}
                        className="w-full appearance-none rounded-2xl bg-black/30 py-3 pl-10 pr-10 text-sm text-white/80 ring-1 ring-white/10 outline-none hover:bg-black/35"
                      >
                        <option value="">Pilih genre</option>
                        {genres.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedGenres.length ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedGenres.map((g) => (
                          <span
                            key={g}
                            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/85 ring-1 ring-white/10"
                          >
                            {g}
                            <button
                              type="button"
                              onClick={() => removeGenre(g)}
                              className="rounded-full bg-white/10 p-1 hover:bg-white/15"
                              aria-label={`Remove ${g}`}
                            >
                              <X className="h-3 w-3 text-white/80" />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-white/50">Belum ada genre dipilih.</p>
                    )}
                  </div>
                </Field>

                {/* File */}
                <Field label="Cover (Gambar)">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="block w-full rounded-2xl bg-black/30 px-4 py-3 text-sm text-white/80 ring-1 ring-white/10 file:mr-3 file:rounded-xl file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:text-white/85 hover:bg-black/35"
                  />
                  <p className="mt-2 text-[11px] text-white/50">
                    Tips: pakai cover portrait biar rapi di grid.
                  </p>
                </Field>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white text-black px-4 py-3 text-sm font-semibold ring-1 ring-white/20 transition hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {loading ? "Uploading..." : "Simpan Komik"}
                </button>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-white/5 p-5 ring-1 ring-white/10 shadow-xl shadow-black/30 backdrop-blur">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Daftar Komik</p>
                  <p className="text-xs text-white/55">
                    Menampilkan <span className="text-white/80 font-semibold">{filteredComics.length}</span> judul
                  </p>
                </div>

                <div className="relative w-full md:max-w-sm">
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
                      aria-label="Clear"
                    >
                      <X className="h-4 w-4 text-white/70" />
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="mt-5">
                {fetching ? (
                  <div className="rounded-3xl bg-black/20 p-8 text-center ring-1 ring-white/10">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-white/70" />
                    <p className="mt-3 text-sm text-white/60">Loading komik…</p>
                  </div>
                ) : filteredComics.length === 0 ? (
                  <div className="rounded-3xl bg-black/20 p-8 text-center ring-1 ring-white/10">
                    <p className="text-sm text-white/70">Belum ada komik / tidak ada yang cocok.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredComics.map((comic) => (
                      <div
                        key={comic.id}
                        className="group overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 shadow-lg shadow-black/30 backdrop-blur transition hover:bg-white/[0.07]"
                      >
                        <div className="relative aspect-[3/4] w-full bg-white/5">
                          <img
                            src={comic.cover_url}
                            alt={comic.judul_buku}
                            className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                        </div>

                        <div className="p-4">
                          <p className="truncate text-sm font-semibold text-white">{comic.judul_buku}</p>
                          <p className="mt-1 text-xs text-white/65 line-clamp-2">{comic.deskripsi}</p>

                          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-white/70">
                            {comic.author ? (
                              <span className="rounded-full bg-white/5 px-2 py-0.5 ring-1 ring-white/10">
                                {comic.author}
                              </span>
                            ) : null}
                            <span className="rounded-full bg-white/5 px-2 py-0.5 ring-1 ring-white/10">
                              Ch. {comic.chapter ?? 0}
                            </span>
                          </div>

                          {Array.isArray(comic.genre) && comic.genre.length ? (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {comic.genre.slice(0, 4).map((g) => (
                                <span
                                  key={g}
                                  className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-white/55 ring-1 ring-white/10"
                                >
                                  {g}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>

                        <div className="h-px bg-white/10" />
                        <div className="flex items-center justify-between px-4 py-3 text-xs text-white/60">
                          <span>ID: {comic.id}</span>
                          <span className="transition-transform group-hover:translate-x-0.5">→</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-xs text-white/45">
          Catatan: kalau kamu mau tombol “Edit / Hapus” di card, bilang aja—aku bikinin UI-nya sekalian.
        </p>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-white/70">{label}</p>
      {children}
    </div>
  );
}
