"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

const SLIDE_INTERVAL = 3500;

const IMAGES = [
  "/images/populer/image.png",
  "/images/populer/image2.png",
  "/images/populer/image3.png",
];

const CAPTIONS = [
  { title: "Trending Minggu Ini", desc: "Komik pilihan dengan art paling gokil." },
  { title: "Update Terbaru", desc: "Bab baru rilis rutin & gampang dicari." },
  { title: "Editor’s Pick", desc: "Rekomendasi manhwa & ilustrasi terbaik." },
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const total = IMAGES.length;

  const next = () => setCurrentIndex((i) => (i + 1) % total);
  const prev = () => setCurrentIndex((i) => (i - 1 + total) % total);

  // autoplay (pause on hover)
  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => next(), SLIDE_INTERVAL);
    return () => clearTimeout(t);
  }, [currentIndex, paused]);

  const caption = useMemo(() => CAPTIONS[currentIndex % CAPTIONS.length], [currentIndex]);

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-120px] left-1/3 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(transparent_1px,rgba(255,255,255,0.04)_1px)] [background-size:18px_18px] opacity-40" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* LEFT */}
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 ring-1 ring-white/15 backdrop-blur">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.15)] animate-pulse" />
              Update baru tiap minggu
              <span className="ml-2 rounded-full bg-emerald-400/15 px-2 py-0.5 text-emerald-200 ring-1 ring-emerald-400/20">
                New
              </span>
            </div>

            <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
              Baca komik makin seru di{" "}
              <span className="bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
                FluxInkVerse
              </span>
              <span className="text-white/70">.</span>
            </h1>

            <p className="max-w-xl text-white/70 leading-relaxed">
              Selamat datang di FluxInkVerse — tempat baca <span className="text-white">komik</span>,{" "}
              <span className="text-white">manhwa</span>, dan <span className="text-white">ilustrasi anime</span>{" "}
              dengan UI modern, nyaman, dan cepat.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 shadow-lg shadow-black/30 transition hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
              >
                Mulai Baca
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 12h12m0 0-5-5m5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white/15"
              >
                Lihat Populer
              </button>
            </div>

            {/* Quick stats */}
            <div className="mt-2 grid max-w-xl grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur">
                <div className="text-lg font-bold">1K+</div>
                <div className="text-xs text-white/60">Judul</div>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur">
                <div className="text-lg font-bold">Fast</div>
                <div className="text-xs text-white/60">Loading</div>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur">
                <div className="text-lg font-bold">HD</div>
                <div className="text-xs text-white/60">Quality</div>
              </div>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {["Komik", "Manhwa", "Ilustrasi", "Romance", "Action", "Fantasy"].map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/70 ring-1 ring-white/10"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative">
            <div
              className="relative overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 shadow-2xl shadow-black/50 backdrop-blur"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {/* Slider */}
              <div className="relative h-[320px] md:h-[440px]">
                {IMAGES.map((img, index) => (
                  <Image
                    key={index}
                    src={img}
                    alt={`Slide ${index + 1}`}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className={[
                      "object-cover object-top transition-opacity duration-700 ease-in-out",
                      index === currentIndex ? "opacity-100" : "opacity-0",
                    ].join(" ")}
                  />
                ))}

                {/* overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

                {/* top tag */}
                <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 text-xs text-white/90 ring-1 ring-white/15 backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                  Trending
                </div>

                {/* caption */}
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="rounded-2xl bg-black/35 p-4 ring-1 ring-white/10 backdrop-blur">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{caption.title}</p>
                        <p className="mt-1 text-xs text-white/70">{caption.desc}</p>
                      </div>
                      <div className="text-xs text-white/70">
                        {String(currentIndex + 1).padStart(2, "0")}/
                        {String(total).padStart(2, "0")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                  <div
                    key={currentIndex} // restart animation on slide change
                    className="h-full origin-left bg-white/70"
                    style={{ animation: `progress ${SLIDE_INTERVAL}ms linear forwards` }}
                  />
                </div>

                {/* Controls */}
                <button
                  type="button"
                  aria-label="Slide sebelumnya"
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-2 ring-1 ring-white/15 backdrop-blur transition hover:bg-black/45"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M15 19 8 12l7-7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <button
                  type="button"
                  aria-label="Slide berikutnya"
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-2 ring-1 ring-white/15 backdrop-blur transition hover:bg-black/45"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="m9 5 7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>

              {/* Dots */}
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex items-center gap-2">
                  {IMAGES.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      aria-label={`Ke slide ${index + 1}`}
                      onClick={() => setCurrentIndex(index)}
                      className={[
                        "h-2.5 rounded-full transition-all duration-300",
                        index === currentIndex ? "w-10 bg-white" : "w-2.5 bg-white/40 hover:bg-white/60",
                      ].join(" ")}
                    />
                  ))}
                </div>

                <div className="text-xs text-white/60">
                  {paused ? "Paused" : "Auto-play"} • klik dot / panah
                </div>
              </div>
            </div>

            {/* Mini feature cards (biar “rame”) */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur">
                <p className="text-sm font-semibold">Bookmark</p>
                <p className="mt-1 text-xs text-white/65">Lanjut baca tanpa ribet.</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur">
                <p className="text-sm font-semibold">Mode Nyaman</p>
                <p className="mt-1 text-xs text-white/65">Enak dibaca siang/malam.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom feature row */}
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "UI Modern & Clean",
              desc: "Tampilan glass + gradient biar premium.",
            },
            {
              title: "Navigasi Cepat",
              desc: "Cari judul, genre, dan update lebih gampang.",
            },
            {
              title: "Gambar Tajam",
              desc: "Preview & cover lebih enak dilihat.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur transition hover:bg-white/[0.07]"
            >
              <p className="text-base font-semibold">{f.title}</p>
              <p className="mt-2 text-sm text-white/65">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* local CSS for progress animation */}
      <style jsx>{`
        @keyframes progress {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>
    </section>
  );
}
