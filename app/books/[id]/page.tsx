"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

interface BookPageProps {
  params: { id: string };
}

export default function BookPage({ params }: BookPageProps) {
  const [book, setBook] = useState<any>(null);
  const id = Number(params.id);

  useEffect(() => {
    const fetchBook = async () => {
      const { data } = await supabase
        .from("komik")
        .select("*")
        .eq("id", id)
        .single();
      setBook(data);
    };
    fetchBook();
  }, [id]);

  if (!book) return <p>Loading...</p>;

  return (
    <section className="mx-auto max-w-5xl px-6 py-10 text-white">
      <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur">
        <h1 className="text-3xl font-extrabold">{book.judul_buku}</h1>
        <p className="mt-1 text-sm text-white/60">Author: {book.author ?? "-"}</p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={book.cover_url}
          alt={book.judul_buku}
          className="my-6 w-full max-w-sm rounded-2xl ring-1 ring-white/10"
        />

        <p className="whitespace-pre-line text-sm text-white/75 leading-relaxed">
          {book.deskripsi}
        </p>

        <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/70">
          <span className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10">
            Chapter: {book.chapter ?? 0}
          </span>
          {Array.isArray(book.genre)
            ? book.genre.map((g: string) => (
                <span
                  key={g}
                  className="rounded-full bg-white/5 px-3 py-1 ring-1 ring-white/10"
                >
                  {g}
                </span>
              ))
            : null}
        </div>
      </div>
    </section>
  );
}
