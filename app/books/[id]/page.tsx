"use client";

import { supabase } from "@/lib/supabase-server";
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
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl font-bold">{book.title}</h1>
      <p className="text-sm text-gray-500">Author: {book.author}</p>
      <img src={book.cover_url} alt={book.title} className="my-4" />
      <p>{book.description}</p>
    </div>
  );
}
