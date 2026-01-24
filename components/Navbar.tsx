"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Menu, X, LogOut, User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function Navbar() {
  const pathname = usePathname();

  const [openMenu, setOpenMenu] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [q, setQ] = useState("");

  const [user, setUser] = useState<SupabaseUser | null>(null);

  const searchRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuBtnRef = useRef<HTMLButtonElement | null>(null);

  const navItems = useMemo(
    () => [
      { name: "Home", href: "/" },
      { name: "Service", href: "/service" },
      { name: "About", href: "/about" },
      { name: "Pengumuman", href: "/pengumuman" },
    ],
    []
  );

  // ✅ REAL auth init + listener (email / google / discord)
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(data.user ?? null);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const isLoggedIn = !!user;

  // ✅ name fallback (works for Google/Discord/email)
  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ??
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    (user?.user_metadata?.preferred_username as string | undefined) ??
    user?.email ??
    "Akun";

  // ✅ avatar fallback (Google often uses picture)
  const avatarUrl =
    (user?.user_metadata?.avatar_url as string | undefined) ??
    (user?.user_metadata?.picture as string | undefined) ??
    null;

  // ctrl/cmd + z to open search, ESC to close
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if ((e.ctrlKey || e.metaKey) && key === "z") {
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

  // click outside to close mobile menu (fixed)
  useEffect(() => {
    if (!openMenu) return;

    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (menuBtnRef.current?.contains(target)) return;
      setOpenMenu(false);
    };

    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [openMenu]);

  useEffect(() => {
    if (openSearch) requestAnimationFrame(() => searchRef.current?.focus());
  }, [openSearch]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOpenMenu(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-zinc-950/35 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/10 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="flex h-16 items-center justify-between">
            {/* LEFT */}
            <div className="flex items-center gap-10">
              <Link href="/" className="group inline-flex items-center gap-2">
                <span className="relative text-xl font-extrabold tracking-tight text-white">
                  FluxInk<span className="text-white/60">Verse</span>
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
                aria-label="Buka pencarian (Ctrl+z)"
              >
                <Search size={16} className="text-white/60" />
                <span className="text-sm text-white/55">Cari komik…</span>
                <span className="ml-2 flex items-center gap-1">
                  <kbd className="rounded-md bg-black/25 px-2 py-0.5 text-[11px] text-white/60 ring-1 ring-white/10">
                    Ctrl
                  </kbd>
                  <kbd className="rounded-md bg-black/25 px-2 py-0.5 text-[11px] text-white/60 ring-1 ring-white/10">
                    z
                  </kbd>
                </span>
              </button>

              {/* ✅ AUTH UI (desktop) */}
              {!isLoggedIn ? (
                <>
                  <Link
                    href="/login"
                    className="hidden md:inline-flex text-sm text-white/70 hover:text-white transition"
                  >
                    Login
                  </Link>

                  <Link
                    href="/register"
                    className="hidden md:inline-flex items-center justify-center rounded-xl bg-white px-4 h-10 text-sm font-semibold text-zinc-950 hover:bg-white/90 transition"
                  >
                    Daftar
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/account"
                    className="hidden md:inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 h-10 ring-1 ring-white/10 hover:bg-white/10 transition"
                  >
                    <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-lg bg-white/10 ring-1 ring-white/10">
                      {avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={avatarUrl}
                          alt="avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User size={16} className="text-white/75" />
                      )}
                    </span>
                    <span className="text-sm text-white/80">{displayName}</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="hidden md:inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 h-10 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white/15 transition"
                  >
                    <LogOut size={16} className="text-white/80" />
                    Logout
                  </button>
                </>
              )}

              {/* Mobile buttons */}
              <button
                type="button"
                onClick={() => {
                  setOpenSearch(true);
                  setOpenMenu(false);
                }}
                className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 transition"
                aria-label="Cari"
              >
                <Search size={18} className="text-white/70" />
              </button>

              <button
                ref={menuBtnRef}
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

          {/* MOBILE DROPDOWN GLASS (compact) */}
          <div
            ref={menuRef}
            className={[
              "md:hidden absolute right-6 top-[64px] w-[260px] origin-top-right",
              "transition duration-200",
              openMenu
                ? "scale-100 opacity-100"
                : "pointer-events-none scale-95 opacity-0",
            ].join(" ")}
          >
            <div className="rounded-xl bg-black ring-1 ring-white/10 shadow-xl shadow-black/50 backdrop-blur-lg overflow-hidden">
              <div className="p-2">
                {/* nav items */}
                <div className="grid gap-1">
                  {navItems.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setOpenMenu(false)}
                        className={[
                          "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition",
                          active
                            ? "bg-white/10 text-white"
                            : "text-white/70 hover:bg-white/5 hover:text-white",
                        ].join(" ")}
                      >
                        <span>{item.name}</span>
                        <span
                          className={[
                            "h-1.5 w-1.5 rounded-full",
                            active ? "bg-emerald-300" : "bg-white/30",
                          ].join(" ")}
                        />
                      </Link>
                    );
                  })}
                </div>

                <div className="my-2 h-px bg-white/10" />

                {/* ✅ AUTH UI (mobile) */}
                {!isLoggedIn ? (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/login"
                      onClick={() => setOpenMenu(false)}
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-white/5 text-sm text-white/80 ring-1 ring-white/10 hover:bg-white/10 transition"
                    >
                      Login
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setOpenMenu(false)}
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-white text-sm font-semibold text-zinc-950 hover:bg-white/90 transition"
                    >
                      Daftar
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      href="/account"
                      onClick={() => setOpenMenu(false)}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-white/5 text-sm text-white/85 ring-1 ring-white/10 hover:bg-white/10 transition"
                    >
                      <span className="grid h-6 w-6 place-items-center overflow-hidden rounded-md bg-white/10 ring-1 ring-white/10">
                        {avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={avatarUrl}
                            alt="avatar"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User size={16} className="text-white/75" />
                        )}
                      </span>
                      Akun
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-white/10 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white/15 transition"
                    >
                      <LogOut size={16} className="text-white/80" />
                      Logout
                    </button>
                  </div>
                )}
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
                  Tips: tekan <span className="text-white/80">Enter</span> untuk
                  submit (kalau sudah ada page search), atau pakai shortcut{" "}
                  <span className="text-white/80">Ctrl/⌘ + Z</span> kapan aja.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {["Trending", "Action", "Romance", "Fantasy", "Slice of Life"].map(
                    (tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setQ(tag)}
                        className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/70 ring-1 ring-white/10 hover:bg-white/10 transition"
                      >
                        {tag}
                      </button>
                    )
                  )}
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
