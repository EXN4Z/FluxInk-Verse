// src/lib/comics.ts
export type ComicItem = {
  id: string;
  title: string;
  slug: string;
  cover: string;
  note: string;
  lastChapter: number;
  updatedAt: string; // ISO
  tags?: string[];

  // extra biar bisa urut populer / explore
  author?: string;
  status?: "Ongoing" | "Completed";
  rating?: number; // 0 - 5
  views?: number; // total views
};

export const COMICS: ComicItem[] = [
  {
    id: "1",
    title: "Solo Leveling",
    slug: "solo-leveling",
    cover: "/images/populer/image.png",
    note: "Arc baru dimulai — vibes makin dark & plot twist makin sering.",
    lastChapter: 58,
    updatedAt: "2026-01-23T20:15:00+07:00",
    tags: ["Action", "Fantasy"],
    author: "Chugong",
    status: "Ongoing",
    rating: 4.9,
    views: 981234,
  },
  {
    id: "2",
    title: "Tonikaku Kawai",
    slug: "tonikaku-kawai",
    cover: "/images/populer/image2.png",
    note: "Slow-burn tapi bikin nagih. Chemistry-nya dapet banget.",
    lastChapter: 24,
    updatedAt: "2026-01-22T18:40:00+07:00",
    tags: ["Romance", "Slice of Life"],
    author: "Kenjiro Hata",
    status: "Ongoing",
    rating: 4.6,
    views: 412900,
  },
  {
    id: "3",
    title: "The Promised Neverland",
    slug: "the-promised-neverland",
    cover: "/images/populer/image3.png",
    note: "Update terbaru fokus world-building & fight choreography.",
    lastChapter: 112,
    updatedAt: "2026-01-21T09:10:00+07:00",
    tags: ["Adventure", "Mystery"],
    author: "Kaiu Shirai",
    status: "Completed",
    rating: 4.7,
    views: 639120,
  },

  // tambahan biar “komik lengkap” (dummy dulu)
  {
    id: "4",
    title: "Jujutsu Kaisen",
    slug: "jujutsu-kaisen",
    cover: "/images/populer/image.png",
    note: "Pertarungan makin brutal, pacing cepet, hype terus.",
    lastChapter: 249,
    updatedAt: "2026-01-20T12:05:00+07:00",
    tags: ["Action", "Supernatural"],
    author: "Gege Akutami",
    status: "Ongoing",
    rating: 4.8,
    views: 1200340,
  },
  {
    id: "5",
    title: "Spy x Family",
    slug: "spy-x-family",
    cover: "/images/populer/image2.png",
    note: "Komedi + family vibes + action ringan yang nagih.",
    lastChapter: 94,
    updatedAt: "2026-01-19T14:30:00+07:00",
    tags: ["Comedy", "Action", "Slice of Life"],
    author: "Tatsuya Endo",
    status: "Ongoing",
    rating: 4.7,
    views: 870540,
  },
  {
    id: "6",
    title: "Chainsaw Man",
    slug: "chainsaw-man",
    cover: "/images/populer/image3.png",
    note: "Chaos tapi emotional. Paneling unik banget.",
    lastChapter: 156,
    updatedAt: "2026-01-18T10:00:00+07:00",
    tags: ["Action", "Horror"],
    author: "Tatsuki Fujimoto",
    status: "Ongoing",
    rating: 4.6,
    views: 990210,
  },
  {
    id: "7",
    title: "One Piece",
    slug: "one-piece",
    cover: "/images/populer/image.png",
    note: "Arc panjang tapi payoff selalu gede. Lore makin dalem.",
    lastChapter: 1102,
    updatedAt: "2026-01-17T08:20:00+07:00",
    tags: ["Adventure", "Action"],
    author: "Eiichiro Oda",
    status: "Ongoing",
    rating: 4.9,
    views: 2400000,
  },
  {
    id: "8",
    title: "Demon Slayer",
    slug: "demon-slayer",
    cover: "/images/populer/image2.png",
    note: "Art clean, fight choreography enak dilihat.",
    lastChapter: 205,
    updatedAt: "2026-01-16T21:00:00+07:00",
    tags: ["Action", "Fantasy"],
    author: "Koyoharu Gotouge",
    status: "Completed",
    rating: 4.5,
    views: 760450,
  },
  {
    id: "9",
    title: "Blue Lock",
    slug: "blue-lock",
    cover: "/images/populer/image3.png",
    note: "Ego battle + strategi sepakbola, tegang terus.",
    lastChapter: 269,
    updatedAt: "2026-01-15T19:25:00+07:00",
    tags: ["Sports", "Drama"],
    author: "Muneyuki Kaneshiro",
    status: "Ongoing",
    rating: 4.4,
    views: 530220,
  },
  {
    id: "10",
    title: "Oshi no Ko",
    slug: "oshi-no-ko",
    cover: "/images/populer/image.png",
    note: "Drama industri hiburan + misteri, bikin penasaran.",
    lastChapter: 141,
    updatedAt: "2026-01-14T16:10:00+07:00",
    tags: ["Drama", "Mystery"],
    author: "Aka Akasaka",
    status: "Ongoing",
    rating: 4.6,
    views: 690800,
  },
  {
    id: "11",
    title: "Horimiya",
    slug: "horimiya",
    cover: "/images/populer/image2.png",
    note: "Romance ringan, wholesome, cocok buat healing.",
    lastChapter: 123,
    updatedAt: "2026-01-13T11:00:00+07:00",
    tags: ["Romance", "Slice of Life"],
    author: "HERO",
    status: "Completed",
    rating: 4.3,
    views: 310500,
  },
  {
    id: "12",
    title: "Tower of God",
    slug: "tower-of-god",
    cover: "/images/populer/image3.png",
    note: "World luas, power system kompleks, karakter bejibun.",
    lastChapter: 600,
    updatedAt: "2026-01-12T09:00:00+07:00",
    tags: ["Fantasy", "Adventure"],
    author: "SIU",
    status: "Ongoing",
    rating: 4.5,
    views: 780900,
  },
];

// lib/comics.ts
export const getPopularComics = (limit = 6) => {
  return [...COMICS]
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .slice(0, limit);
};

export const formatDateID = (iso: string) => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(new Date(iso));
};

export const formatCompactID = (n: number) => {
  return new Intl.NumberFormat("id-ID", { notation: "compact" }).format(n);
};
