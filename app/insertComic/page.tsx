"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type Comic = {
  id: number;
  judul_buku: string;
  deskripsi:string;
  cover_url: string;
  author: string;
  chapter: number;
};

export default function AddComic() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [comics, setComics] = useState<Comic[]>([]);
  const [desc, setDesc] = useState("");
  const [author, setAuthor] = useState("");
  const [chap, setChap] = useState<number>(0);
  const [genre, setGenres] = useState<string[]>([]);
  const [selectedGenre, setSelectedGenres] = useState<string[]>([]);
  const [currentGenre, setCurrentGenre] = useState("");

  // 🔹 ambil data awal
  useEffect(() => {
    const fetchComics = async () => {
      const { data, error } = await supabase
        .from("komik")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setComics(data);
      }
    };

    fetchComics();
  }, []);
 useEffect(() => {
  const fetchGenre = async () => {
    const { data, error } = await supabase
      .from("genre")
      .select("genre");

    if (!error && data) {
      const flattened = data.flatMap((row) =>
        Array.isArray(row.genre) ? row.genre : []
      );

      const unique = [...new Set(flattened)];

      setGenres(unique);
    }
  };

  fetchGenre();
}, []);


  const handleSubmit = async () => {
    if (!title || !file) {
      alert("Judul dan gambar wajib diisi");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ upload ke storage
      const fileName = `cover-${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("covers")
        .upload(fileName, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // 2️⃣ ambil public url
      const { data: publicData } = supabase.storage
        .from("covers")
        .getPublicUrl(fileName);

      if (!publicData?.publicUrl) {
        throw new Error("Gagal mengambil public URL");
      }

      // 3️⃣ insert ke database + ambil data baru
      const { data: newComic, error: insertError } = await supabase
        .from("komik")
        .insert({
          judul_buku: title,
          deskripsi: desc,
          cover_url: publicData.publicUrl,
          author: author,
          chapter: chap,
          genre: selectedGenre,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 4️⃣ update UI langsung
      setComics((prev) => [newComic, ...prev]);

      // reset form
      setTitle("");
      setFile(null);
      setDesc("");
      setAuthor("");
      setChap(0);

      alert("Komik berhasil ditambahkan ✅");
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {/* FORM */}
      <div className="space-y-3 max-w-sm">
        <input
          type="text"
          placeholder="Judul komik"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          type="text"
          placeholder="deskripsi komik"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          type="text"
          placeholder="Author komik"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          type="number"
          placeholder="Chapter Komik"
          value={chap}
          onChange={(e) => setChap(Number(e.target.value))}
        />
        <div className="flex flex-wrap gap-2 mt-2">
        <select
          value={currentGenre}
          onChange={(e) => {
            const value = e.target.value;
            if (!value) return;

            if (selectedGenre.includes(value)) return;

            setSelectedGenres((prev) => [...prev, value]);
            setCurrentGenre(""); // reset select
          }}
          className="border p-2 w-full"
        >
          <option value="">Pilih genre</option>
          {genre.map((g) => (
            <option key={g} value={g} className="text-black bg-gray-500">
              {g}
            </option>
          ))}
        </select>

<div className="flex flex-wrap gap-2 mt-2">
  {selectedGenre.map((g) => (
    <span
      key={g}
      className="bg-blue-100 px-3 py-1 rounded-full text-sm flex items-center gap-2 text-black"
    >
      {g}
      <button
        type="button"
        onClick={() =>
          setSelectedGenres((prev) => prev.filter((x) => x !== g))
        }
        className="text-red-500 font-bold"
      >
        ×
      </button>
    </span>
  ))}
</div>

</div>



        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Simpan"}
        </button>
      </div>

      {/* LIST KOMIK */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {comics.map((comic) => (
          <div key={comic.id} className="border rounded p-2">
            <img
              src={comic.cover_url}
              alt={comic.judul_buku}
              className="w-full h-48 object-cover rounded"
            />
            <p className="mt-2 font-semibold text-center">
              {comic.judul_buku}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
