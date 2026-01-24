"use client";

import Link from "next/link";
import { FaTiktok, FaFacebook, FaInstagram } from "react-icons/fa";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-full border-t border-white/10 bg-zinc-950/35 backdrop-blur-xl">
      {/* glow / gradient top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <Link href="/" className="group inline-flex items-center gap-2">
              <span className="relative text-lg font-extrabold tracking-tight text-white">
                FluxInk<span className="text-white/60">Verse</span>
                <span className="absolute -bottom-2 left-0 h-[2px] w-0 bg-white/70 transition-all duration-300 group-hover:w-full" />
              </span>

              <span className="inline-flex rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/70 ring-1 ring-white/10">
                beta
              </span>
            </Link>

            <p className="max-w-sm text-sm text-white/60">
              Platform baca komik yang fokus ke pengalaman cepat, bersih, dan nyaman di semua device.
            </p>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-white/65 ring-1 ring-white/10">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_0_6px_rgba(16,185,129,0.12)]" />
                Online
              </span>

              <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-xs text-white/65 ring-1 ring-white/10">
                Updates tiap minggu
              </span>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 md:justify-self-center">
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-wide text-white/80">
                Navigasi
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link className="text-white/60 hover:text-white transition" href="/">
                    Home
                  </Link>
                </li>
                <li>
                  <Link className="text-white/60 hover:text-white transition" href="/service">
                    Service
                  </Link>
                </li>
                <li>
                  <Link className="text-white/60 hover:text-white transition" href="/about">
                    About
                  </Link>
                </li>
                <li>
                  <Link className="text-white/60 hover:text-white transition" href="/pengumuman">
                    Pengumuman
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-wide text-white/80">
                Legal
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link className="text-white/60 hover:text-white transition" href="/privacy">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link className="text-white/60 hover:text-white transition" href="/terms">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link className="text-white/60 hover:text-white transition" href="/contact">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Social / CTA */}
          <div className="space-y-3 md:justify-self-end">
            <p className="text-xs font-semibold tracking-wide text-white/80">
              Ikuti kami
            </p>

            <div className="flex items-center gap-2">
              <a
                href="#"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
                aria-label="Twitter"
              >
                <FaTiktok size={18} className="text-white/70" />
              </a>
              <a
                href="#"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
                aria-label="Instagram"
              >
                <FaInstagram size={18} className="text-white/70" />
              </a>
              <a
                href="#"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
                aria-label="GitHub"
              >
                <FaFacebook size={18} className="text-white/70" />
              </a>
            </div>

            <p className="text-sm text-white/55">
              Punya ide fitur? Kirim saran lewat{" "}
              <Link href="/contact" className="text-white/75 hover:text-white transition underline underline-offset-4 decoration-white/20 hover:decoration-white/40">
                Contact
              </Link>
              .
            </p>
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-white/45">
            © {year} FluxInkVerse. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/60 ring-1 ring-white/10">
              Built with Next.js
            </span>
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/60 ring-1 ring-white/10">
              Supabase Ready
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
