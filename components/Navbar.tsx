"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Service", href: "/service" },
    { name: "About", href: "/about" },
    { name: "Pengumuman", href: "/pengumuman" },
  ];

  return (
    <nav className="w-full bg-transparent border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        <div className="flex items-center gap-10">
          <Link href="/" className="text-xl font-bold text-white">
            Fluxink
          </Link>

          <ul className="hidden md:flex gap-6 ">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`text-sm transition ${
                      isActive
                        ? "text-white"
                        : "text-white/60 hover:text-white"
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          
          {/* SEARCH BAR */}
          <div className="hidden md:flex items-center gap-2 px-3 h-9 rounded-lg bg-white/10 border border-white/10">
            <Search size={16} className="text-white/60" />
            <input
              type="text"
              placeholder="Cari Komik"
              className="bg-transparent outline-none text-sm text-white placeholder:text-white/40 w-36"
            />
            <span className="text-xs text-white/40 border border-white/20 px-1.5 py-0.5 rounded">
              Ctrl + K
            </span>
          </div>

          {/* AUTH */}
          <Link
            href="/login"
            className="text-sm text-white/70 hover:text-white transition"
          >
            Sign in
          </Link>

          <Link
            href="/register"
            className="px-4 py-1.5 text-sm rounded-lg bg-white text-black hover:bg-white/90 transition"
          >
            Log in
          </Link>
        </div>
      </div>
    </nav>
  );
}
