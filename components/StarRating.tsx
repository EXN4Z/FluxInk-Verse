"use client";

import { useEffect, useState, useTransition } from "react";
import { supabase } from "@/lib/supabase";
import { AlertCircle } from "lucide-react";

type Props = {
  komikId: number;
  initialAvg: number | null;
  initialCount: number;
};

export default function StarRating({
  komikId,
  initialAvg,
  initialCount,
}: Props) {
  const [myRating, setMyRating] = useState<number | null>(null);
  const [avg, setAvg] = useState<number>(Number(initialAvg ?? 0));
  const [count, setCount] = useState<number>(Number(initialCount ?? 0));
  const [isPending, startTransition] = useTransition();

  // inline alert state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      const user = userRes.user;
      if (!user) return;

      const { data } = await supabase
        .from("komik_ratings")
        .select("rating")
        .eq("komik_id", komikId)
        .eq("user_id", user.id)
        .maybeSingle();

      setMyRating(data?.rating ?? null);
    })();
  }, [komikId]);

  async function submitRating(value: number) {
    setErrorMsg(null);

    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;

    if (!user) {
      setErrorMsg("Login dulu untuk memberikan rating.");
      return;
    }

    setMyRating(value);

    const { error } = await supabase
      .from("komik_ratings")
      .upsert(
        {
          komik_id: komikId,
          user_id: user.id,
          rating: value,
        },
        { onConflict: "komik_id,user_id" }
      );

    if (error) {
      console.error(error);
      setErrorMsg("Gagal mengirim rating. Coba lagi.");
      return;
    }

    startTransition(async () => {
      const { data, error } = await supabase
        .from("komik")
        .select("rating, rating_count")
        .eq("id", komikId)
        .single();

      if (!error && data) {
        setAvg(Number(data.rating ?? 0));
        setCount(Number(data.rating_count ?? 0));
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {/* ⭐ STAR */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((v) => (
          <button
            key={v}
            onClick={() => submitRating(v)}
            disabled={isPending}
            className="text-xl transition-transform hover:scale-125 disabled:opacity-60"
            aria-label={`Rate ${v}`}
          >
            {(myRating ?? 0) >= v ? (
              <span className="text-yellow-400">★</span>
            ) : (
              <span className="text-white/40">☆</span>
            )}
          </button>
        ))}

        <span className="text-sm text-white/70">
          {avg.toFixed(1)} ({count})
        </span>
      </div>

      {/* 🔴 ALERT MERAH (INLINE) */}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
