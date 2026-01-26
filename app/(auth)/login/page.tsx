"use client";

import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M21.35 11.1H12v2.9h5.35c-.55 3.2-3.6 4.8-5.35 4.8a6.1 6.1 0 1 1 0-12.2c1.6 0 2.75.65 3.35 1.2l2-1.95A8.6 8.6 0 1 0 12 20.6c4.95 0 8.35-3.5 8.35-8.45 0-.6-.05-.95-.15-1.05Z"
      />
    </svg>
  );
}

function DiscordIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M19.54 5.34A16.3 16.3 0 0 0 15.7 4.2a13.5 13.5 0 0 0-.5 1.05 15.2 15.2 0 0 0-4.4 0c-.14-.35-.32-.72-.5-1.05a16.3 16.3 0 0 0-3.84 1.14C4.1 9 3.5 12.55 3.8 16.06A16.6 16.6 0 0 0 8.7 18.7c.4-.55.75-1.15 1.06-1.78-.58-.22-1.14-.5-1.67-.84.14-.1.28-.2.4-.3 3.2 1.5 6.68 1.5 9.85 0 .13.1.27.2.4.3-.53.34-1.09.62-1.67.84.31.63.66 1.23 1.06 1.78 1.6-.53 3.15-1.4 4.9-2.64.34-3.98-.58-7.5-2.46-10.76ZM9.3 14.4c-.66 0-1.2-.6-1.2-1.34 0-.74.53-1.35 1.2-1.35.67 0 1.2.61 1.2 1.35 0 .74-.53 1.34-1.2 1.34Zm5.4 0c-.66 0-1.2-.6-1.2-1.34 0-.74.53-1.35 1.2-1.35.67 0 1.2.61 1.2 1.35 0 .74-.53 1.34-1.2 1.34Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/` },
    });
    if (error) alert(error.message);
  };

  const loginWithDiscord = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: `${location.origin}/` },
    });
    if (error) alert(error.message);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    // redirect PALING AMAN (anti cache / service worker)
    window.location.assign("/");
  };

  return (
    <div className="relative w-full max-w-sm">
      <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur-xl shadow-xl shadow-black/40">
        <div className="mb-5">
          <h1 className="text-xl font-bold">Selamat Datang Kembali</h1>
          <p className="mt-1 text-sm text-white/65">
            Login untuk lanjut baca di FluxInkVerse.
          </p>
        </div>

        {/* Social connect */}
        <div className="grid gap-2">
          <button
            type="button"
            onClick={loginWithGoogle}
            className="h-10 w-full rounded-lg bg-black/25 px-4 text-[13px] font-semibold text-white/85 ring-1 ring-white/10 transition hover:bg-black/35 flex items-center justify-center gap-2"
          >
            <GoogleIcon className="h-4 w-4 text-white/80" />
            Log in dengan Google
          </button>

          <button
            type="button"
            onClick={loginWithDiscord}
            className="h-10 w-full rounded-lg bg-black/25 px-4 text-[13px] font-semibold text-white/85 ring-1 ring-white/10 transition hover:bg-black/35 flex items-center justify-center gap-2"
          >
            <DiscordIcon className="h-4 w-4 text-white/80" />
            Log in dengan Discord
          </button>
        </div>

        {/* Divider */}
        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[11px] text-white/40">atau</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form className="space-y-3">
          <div>
            <label className="text-xs text-white/70">Email</label>
            <input
              type="email"
              required
              placeholder="email@gmail.com"
              className="mt-1.5 h-10 w-full rounded-lg bg-black/25 px-4 text-sm text-white placeholder:text-white/40 ring-1 ring-white/10 outline-none focus:ring-white/25"
            />
          </div>

          <div>
            <label className="text-xs text-white/70">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="mt-1.5 h-10 w-full rounded-lg bg-black/25 px-4 text-sm text-white placeholder:text-white/40 ring-1 ring-white/10 outline-none focus:ring-white/25"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-10 w-full rounded-lg bg-white text-zinc-950 text-sm font-semibold hover:bg-white/90 transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Back */}
        <div className="mt-3 text-center">
          <Link href="/" className="text-xs text-white/60 hover:text-white transition">
            ← Kembali ke Halaman awal
          </Link>
        </div>

        <p className="mt-4 text-center text-xs text-white/60">
          Belum punya akun?{" "}
          <Link href="/register" className="text-white hover:underline">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}
