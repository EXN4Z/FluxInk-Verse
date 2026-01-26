"use client";

import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

type Comic = {
  id: number;
  title: string;
  cover_url: string;
};

export default function AddComic() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [comics, setComics] = useState<Comic[]>([]);

  // 🔹 ambil data awal
  useEffect(() => {
    const fetchComics = async () => {
      const { data, error } = await supabase
        .from("comics")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setComics(data);
      }
    };

    fetchComics();
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
        .from("comics")
        .insert({
          title,
          cover_url: publicData.publicUrl,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 4️⃣ update UI langsung
      setComics((prev) => [newComic, ...prev]);

      // reset form
      setTitle("");
      setFile(null);

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
              alt={comic.title}
              className="w-full h-48 object-cover rounded"
            />
            <p className="mt-2 font-semibold text-center">
              {comic.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
