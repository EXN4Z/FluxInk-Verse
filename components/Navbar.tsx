"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const [openMenu, setOpenMenu] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [q, setQ] = useState("");

  const searchRef = useRef<HTMLInputElement | null>(null);

  const navItems = useMemo(
    () => [
      { name: "Home", href: "/" },
      { name: "Service", href: "/service" },
      { name: "About", href: "/about" },
      { name: "Pengumuman", href: "/pengumuman" },
    ],
    []
  );

  // ctrl/cmd + k to open search, ESC to close
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if ((e.ctrlKey || e.metaKey) && key === "k") {
        e.preventDefault();
        setOpenSearch(true);
        setOpenMenu(false);
      }

      if (e.key === "Escape") {
        setOpenSearch(false);
        setOpenMenu(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (openSearch) {
      // kasih delay dikit biar input pasti ke-mount
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [openSearch]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-zinc-950/35 backdrop-blur-xl">
        {/* subtle glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between">
            {/* LEFT */}
            <div className="flex items-center gap-10">
              <Link href="/" className="group inline-flex items-center gap-2">
                <span className="relative text-xl font-extrabold tracking-tight text-white">
                  FluxInk
                  <span className="text-white/60">Verse</span>
                  <span className="absolute -bottom-2 left-0 h-[2px] w-0 bg-white/70 transition-all duration-300 group-hover:w-full" />
                </span>

                <span className="hidden sm:inline-flex rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/70 ring-1 ring-white/10">
                  beta
                </span>
              </Link>

              {/* Desktop nav */}
              <ul className="hidden md:flex items-center gap-2">
                {navItems.map((item) => {
                  const active = isActive(item.href);

                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={[
                          "relative inline-flex items-center rounded-full px-4 py-2 text-sm transition",
                          active
                            ? "bg-white/10 text-white ring-1 ring-white/15"
                            : "text-white/65 hover:text-white hover:bg-white/5",
                        ].join(" ")}
                      >
                        {item.name}
                        {active && (
                          <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-emerald-300 shadow-[0_0_0_6px_rgba(16,185,129,0.12)]" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">
              {/* Search (desktop) */}
              <button
                type="button"
                onClick={() => setOpenSearch(true)}
                className="hidden md:flex items-center gap-2 rounded-xl bg-white/5 px-3 h-10 ring-1 ring-white/10 hover:bg-white/10 transition"
                aria-label="Buka pencarian (Ctrl+K)"
              >
                <Search size={16} className="text-white/60" />
                <span className="text-sm text-white/55">Cari komik…</span>
                <span className="ml-2 flex items-center gap-1">
                  <kbd className="rounded-md bg-black/25 px-2 py-0.5 text-[11px] text-white/60 ring-1 ring-white/10">
                    Ctrl
                  </kbd>
                  <kbd className="rounded-md bg-black/25 px-2 py-0.5 text-[11px] text-white/60 ring-1 ring-white/10">
                    K
                  </kbd>
                </span>
              </button>

              {/* Auth (desktop) */}
              <Link
                href="/login"
                className="hidden md:inline-flex text-sm text-white/70 hover:text-white transition"
              >
                Sign in
              </Link>

              <Link
                href="/register"
                className="hidden md:inline-flex items-center justify-center rounded-xl bg-white px-4 h-10 text-sm font-semibold text-zinc-950 hover:bg-white/90 transition"
              >
                Sign up
              </Link>

              {/* Mobile buttons */}
              <button
                type="button"
                onClick={() => setOpenSearch(true)}
                className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
                aria-label="Cari"
              >
                <Search size={18} className="text-white/70" />
              </button>

              <button
                type="button"
                onClick={() => setOpenMenu((v) => !v)}
                className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
                aria-label="Menu"
                aria-expanded={openMenu}
              >
                {openMenu ? (
                  <X size={18} className="text-white/70" />
                ) : (
                  <Menu size={18} className="text-white/70" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu panel */}
          <div
            className={[
              "md:hidden overflow-hidden transition-[max-height,opacity] duration-300",
              openMenu ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0",
            ].join(" ")}
          >
            <div className="pb-6 pt-2">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => {
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setOpenMenu(false)}
                      className={[
                        "rounded-2xl px-4 py-3 text-sm transition ring-1 ring-white/10",
                        active
                          ? "bg-white/10 text-white"
                          : "bg-white/5 text-white/75 hover:bg-white/10 hover:text-white",
                      ].join(" ")}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-4 flex gap-3">
                <Link
                  href="/login"
                  onClick={() => setOpenMenu(false)}
                  className="flex-1 inline-flex items-center justify-center rounded-xl bg-white/5 h-10 text-sm text-white/80 ring-1 ring-white/10 hover:bg-white/10 transition"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpenMenu(false)}
                  className="flex-1 inline-flex items-center justify-center rounded-xl bg-white h-10 text-sm font-semibold text-zinc-950 hover:bg-white/90 transition"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      {openSearch && (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpenSearch(false)}
          />
          <div className="relative mx-auto mt-20 w-[92%] max-w-xl">
            <div className="overflow-hidden rounded-2xl bg-zinc-900/75 ring-1 ring-white/10 shadow-2xl">
              <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                <Search size={18} className="text-white/60" />
                <input
                  ref={searchRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Cari judul, genre, author…"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                />
                <kbd className="rounded-md bg-black/25 px-2 py-0.5 text-[11px] text-white/60 ring-1 ring-white/10">
                  ESC
                </kbd>
              </div>

              <div className="p-4">
                <p className="text-xs text-white/55">
                  Tips: tekan <span className="text-white/80">Enter</span> untuk submit (kalau sudah ada page search),
                  atau pakai shortcut <span className="text-white/80">Ctrl/⌘ + K</span> kapan aja.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {["Trending", "Action", "Romance", "Fantasy", "Slice of Life"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setQ(tag)}
                      className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/70 ring-1 ring-white/10 hover:bg-white/10 transition"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-3 text-center text-xs text-white/40">
              Klik area gelap untuk menutup
            </p>
          </div>
        </div>
      )}
    </>
  );
}
