/* (FILE INI PANJANG: kamu cukup copas full dari project kamu yang sudah ada,
   lalu pastikan bagian yang aku tambahin ini ADA — tapi biar kamu gak bingung,
   aku kasih FULL file di bawah ini apa adanya sesuai yang sudah kupasang.) */

"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type Flash = { type: "success" | "error"; text: string };

function safeStr(v: any): string | null {
  if (typeof v === "string" && v.trim()) return v.trim();
  return null;
}

function pickDisplayName(user: any): string {
  const meta = user?.user_metadata ?? {};
  return (
    safeStr(meta.display_name) ||
    safeStr(meta.full_name) ||
    safeStr(meta.name) ||
    safeStr(meta.user_name) ||
    safeStr(user?.email?.split?.("@")[0]) ||
    "User"
  );
}

function pickBio(user: any): string {
  const meta = user?.user_metadata ?? {};
  return safeStr(meta.bio) ?? "";
}

function pickProvider(user: any): string {
  const app = user?.app_metadata ?? {};
  // Supabase biasanya taruh provider terakhir di app_metadata.provider
  return safeStr(app.provider) || safeStr(user?.identities?.[0]?.provider) || "email";
}

function pickSocialAvatarUrl(user: any): string | null {
  const meta = user?.user_metadata ?? {};

  // Supabase OAuth (Google/Discord) sering ngisi salah satu dari ini
  const direct =
    safeStr(meta.avatar_url) ||
    safeStr(meta.picture) ||
    safeStr(meta.avatar) ||
    safeStr(meta.image) ||
    safeStr(meta.profile_image_url);
  if (direct) return direct;

  // Kadang ada di identities[].identity_data
  const identities: any[] = Array.isArray(user?.identities) ? user.identities : [];
  for (const id of identities) {
    const d = id?.identity_data ?? {};
    const v = safeStr(d.avatar_url) || safeStr(d.picture) || safeStr(d.avatar) || safeStr(d.image);
    if (v) return v;
  }

  return null;
}

function pickCustomAvatarUrl(user: any): string | null {
  const meta = user?.user_metadata ?? {};
  return safeStr(meta.custom_avatar_url) || null;
}

function formatProvider(provider: string) {
  const p = (provider || "").toLowerCase();
  if (p === "google") return "Google";
  if (p === "discord") return "Discord";
  if (p === "email") return "Email";
  return provider || "Unknown";
}

function Avatar({ url, size = 96, alt }: { url: string | null; size?: number; alt: string }) {
  return (
    <div
      className="grid place-items-center overflow-hidden rounded-full bg-white/5 ring-1 ring-white/15"
      style={{ width: size, height: size }}
    >
      {url ? (
        // Pakai <img> biar nggak perlu next/image remotePatterns
        <img
          src={url}
          alt={alt}
          width={size}
          height={size}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // kalau url error, balik ke placeholder (hapus src)
            (e.currentTarget as HTMLImageElement).src = "";
          }}
        />
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-1/2 w-1/2 text-white/35">
          <path
            fill="currentColor"
            d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5Zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5Z"
          />
        </svg>
      )}
    </div>
  );
}

function validateAvatarFile(file: File): string | null {
  const maxBytes = 5 * 1024 * 1024; // 5MB
  if (!file.type.startsWith("image/")) return "File harus gambar (jpg/png/webp).";
  if (file.size > maxBytes) return "Ukuran gambar maksimal 5MB.";
  return null;
}

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<Flash | null>(null);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [premium, setPremium] = useState<{ is_premium: boolean; premium_since: string | null } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const provider = useMemo(() => (user ? pickProvider(user) : ""), [user]);
  const customAvatarUrl = useMemo(() => (user ? pickCustomAvatarUrl(user) : null), [user]);
  const socialAvatarUrl = useMemo(() => (user ? pickSocialAvatarUrl(user) : null), [user]);
  const avatarUrl = useMemo(() => customAvatarUrl || socialAvatarUrl || null, [customAvatarUrl, socialAvatarUrl]);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const refreshUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    setUser(data.user);
    return data.user;
  };

  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      setLoading(true);
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        setFlash({ type: "error", text: error.message });
        setLoading(false);
        return;
      }

      const sessionUser = data.session?.user ?? null;
      if (!sessionUser) {
        router.replace("/login");
        setLoading(false);
        return;
      }

      setUser(sessionUser);
      setDisplayName(pickDisplayName(sessionUser));
      setBio(pickBio(sessionUser));

      // ✅ ambil role/gelar premium dari tabel profiles
      const { data: prof } = await supabase
        .from("profiles")
        .select("is_premium, premium_since")
        .eq("id", sessionUser.id)
        .maybeSingle();

      setPremium({
        is_premium: !!prof?.is_premium,
        premium_since: (prof?.premium_since as string | null) ?? null,
      });
      setLoading(false);
    };

    boot();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (!u) router.replace("/login");
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, [router]);

  // refresh premium kalau tab balik aktif (habis bayar)
  useEffect(() => {
    if (!user?.id) return;

    const run = async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("is_premium, premium_since")
        .eq("id", user.id)
        .maybeSingle();
      setPremium({
        is_premium: !!prof?.is_premium,
        premium_since: (prof?.premium_since as string | null) ?? null,
      });
    };

    const onFocus = () => run();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [user?.id]);

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePickFile = (f: File | null) => {
    setFlash(null);
    if (!f) {
      clearFile();
      return;
    }

    const err = validateAvatarFile(f);
    if (err) {
      setFlash({ type: "error", text: err });
      clearFile();
      return;
    }

    setFile(f);
  };

  const saveProfile = async () => {
    if (!user) return;

    setSaving(true);
    setFlash(null);

    try {
      let nextCustomAvatarUrl: string | undefined;
      let nextCustomAvatarPath: string | undefined;

      if (file) {
        // (Opsional) hapus avatar lama biar storage nggak numpuk
        const oldPath = safeStr(user?.user_metadata?.custom_avatar_path);
        if (oldPath) {
          try {
            await supabase.storage.from("avatars").remove([oldPath]);
          } catch {
            // ignore (kadang policy nggak ngizinin remove)
          }
        }

        const ext = (file.name.split(".").pop() || "png").toLowerCase();
        const path = `${user.id}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
          upsert: true,
          contentType: file.type,
        });

        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage.from("avatars").getPublicUrl(path);
        if (!publicData?.publicUrl) throw new Error("Gagal mengambil public URL avatar.");

        nextCustomAvatarUrl = publicData.publicUrl;
        nextCustomAvatarPath = path;
      }

      const nextData: Record<string, any> = {
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
      };

      if (nextCustomAvatarUrl !== undefined) {
        nextData.custom_avatar_url = nextCustomAvatarUrl;
        nextData.custom_avatar_path = nextCustomAvatarPath ?? null;
      }

      const { error: updateError } = await supabase.auth.updateUser({ data: nextData });
      if (updateError) throw updateError;

      const newUser = await refreshUser();
      setDisplayName(pickDisplayName(newUser));
      setBio(pickBio(newUser));
      clearFile();

      setFlash({ type: "success", text: "Profil berhasil diupdate." });
    } catch (e: any) {
      setFlash({ type: "error", text: e?.message || "Gagal update profil." });
    } finally {
      setSaving(false);
    }
  };

  const resetAvatarToSocial = async () => {
    if (!user) return;

    setSaving(true);
    setFlash(null);

    try {
      const oldPath = safeStr(user?.user_metadata?.custom_avatar_path);
      if (oldPath) {
        try {
          await supabase.storage.from("avatars").remove([oldPath]);
        } catch {
          // ignore
        }
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          custom_avatar_url: null,
          custom_avatar_path: null,
        },
      });
      if (error) throw error;

      await refreshUser();
      clearFile();

      setFlash({
        type: "success",
        text: socialAvatarUrl
          ? "Avatar dikembalikan ke avatar sosmed."
          : "Avatar custom dihapus. (Kamu belum punya avatar sosmed, jadi akan tampil avatar kosong)",
      });
    } catch (e: any) {
      setFlash({ type: "error", text: e?.message || "Gagal reset avatar." });
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.assign("/login");
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">Loading profile…</div>
        </div>
      </section>
    );
  }

  // Kalau user null, efek di atas bakal redirect ke /login
  if (!user) return null;

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-[-120px] left-1/3 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(transparent_1px,rgba(255,255,255,0.04)_1px)] [background-size:18px_18px] opacity-40" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 py-12">
        <div className="flex flex-col gap-2">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 ring-1 ring-white/15 backdrop-blur">
            Profile
            <span className="ml-1 text-white/50">•</span>
            <span className="text-white/60">{formatProvider(provider)}</span>
          </div>
          <h1 className="text-3xl font-extrabold md:text-4xl">Profil Kamu</h1>
          <p className="max-w-2xl text-sm text-white/65">
            Avatar otomatis diambil dari Google/Discord kalau ada. Kalau tidak ada, akan tampil avatar kosong. Kamu juga bisa ganti avatar sendiri.
          </p>
        </div>

        {flash ? (
          <div
            className={`mt-6 rounded-2xl px-4 py-3 text-sm ring-1 backdrop-blur ${
              flash.type === "success"
                ? "bg-emerald-500/10 text-emerald-100 ring-emerald-400/20"
                : "bg-red-500/10 text-red-100 ring-red-400/20"
            }`}
          >
            {flash.text}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Summary */}
          <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur">
            <div className="flex items-center gap-4">
              <Avatar url={avatarUrl} size={92} alt="Avatar" />
              <div className="min-w-0">
                <div className="truncate text-lg font-bold">{pickDisplayName(user)}</div>
                <div className="truncate text-sm text-white/60">{user.email}</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center rounded-full bg-black/25 px-3 py-1 text-xs text-white/70 ring-1 ring-white/10">
                    Login via {formatProvider(provider)}
                  </div>

                  {/* ✅ role / gelar */}
                  {premium?.is_premium ? (
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-200 ring-1 ring-emerald-400/20">
                      <span className="text-[11px]">👑</span>
                      Premium Member
                      {premium.premium_since ? (
                        <span className="text-emerald-100/70">
                          • sejak {new Date(premium.premium_since).toLocaleDateString("id-ID")}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 ring-1 ring-white/10">
                      Free User
                      <button
                        type="button"
                        onClick={() => router.push("/premium")}
                        className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/80 ring-1 ring-white/10 hover:bg-white/15"
                      >
                        Upgrade
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ✅ kartu status premium (biar kelihatan dinamis) */}
            <div className="mt-6 rounded-2xl bg-black/20 px-4 py-3 ring-1 ring-white/10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-white/60">Membership</div>
                  <div className="mt-1 text-sm font-semibold text-white/85">{premium?.is_premium ? "Premium" : "Free"}</div>
                  <div className="mt-0.5 text-xs text-white/50">
                    {premium?.is_premium ? "Kamu punya akses fitur premium." : "Upgrade untuk akses fitur premium + badge."}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/premium")}
                  className="h-9 rounded-2xl bg-white px-4 text-xs font-semibold text-zinc-950 hover:bg-white/90"
                >
                  {premium?.is_premium ? "Kelola" : "Upgrade"}
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-3 text-sm text-white/70">
              <div className="flex items-center justify-between rounded-2xl bg-black/20 px-4 py-3 ring-1 ring-white/10">
                <span className="text-white/60">Avatar Sosmed</span>
                <div className="flex items-center gap-2">
                  <Avatar url={socialAvatarUrl} size={36} alt="Social avatar" />
                  <span className="text-xs text-white/60">{socialAvatarUrl ? "Terdeteksi" : "Tidak ada"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-black/20 px-4 py-3 ring-1 ring-white/10">
                <span className="text-white/60">Avatar Custom</span>
                <div className="flex items-center gap-2">
                  <Avatar url={customAvatarUrl} size={36} alt="Custom avatar" />
                  <span className="text-xs text-white/60">{customAvatarUrl ? "Aktif" : "Tidak"}</span>
                </div>
              </div>

              {pickBio(user) ? (
                <div className="rounded-2xl bg-black/20 px-4 py-3 ring-1 ring-white/10">
                  <div className="text-xs text-white/60">Bio</div>
                  <div className="mt-1 whitespace-pre-wrap text-white/80">{pickBio(user)}</div>
                </div>
              ) : (
                <div className="rounded-2xl bg-black/20 px-4 py-3 ring-1 ring-white/10 text-white/55">Bio masih kosong.</div>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="h-10 rounded-2xl bg-white/10 px-4 text-sm text-white/85 ring-1 ring-white/10 hover:bg-white/15"
              >
                ← Kembali
              </button>
              <button
                type="button"
                onClick={signOut}
                className="h-10 rounded-2xl bg-black/30 px-4 text-sm text-white/85 ring-1 ring-white/10 hover:bg-black/40"
              >
                Logout
              </button>
            </div>

            <p className="mt-4 text-xs text-white/45">
              Catatan: untuk fitur upload avatar, pastikan sudah ada bucket Storage bernama <b>avatars</b>. Biar URL bisa dipakai langsung, set bucket jadi{" "}
              <b>public</b> atau pakai signed URL.
            </p>
          </div>

          {/* Edit form */}
          <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur">
            <h2 className="text-lg font-bold">Ganti Profil</h2>
            <p className="mt-1 text-sm text-white/60">
              Ubah nama, bio, atau avatar. Kalau avatar custom dihapus, sistem akan otomatis balik ke avatar sosmed (Google/Discord) jika tersedia.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs text-white/70">Display name</label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nama yang tampil"
                  className="mt-1.5 h-10 w-full rounded-2xl bg-black/30 px-4 text-sm text-white/90 ring-1 ring-white/10 outline-none placeholder:text-white/40 focus:ring-white/20"
                />
              </div>

              <div>
                <label className="text-xs text-white/70">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Tulis bio singkat…"
                  className="mt-1.5 w-full resize-none rounded-2xl bg-black/30 px-4 py-3 text-sm text-white/90 ring-1 ring-white/10 outline-none placeholder:text-white/40 focus:ring-white/20"
                />
              </div>

              <div>
                <label className="text-xs text-white/70">Avatar</label>
                <div className="mt-1.5 flex items-center gap-3">
                  <Avatar url={previewUrl ?? avatarUrl} size={52} alt="Avatar preview" />
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePickFile(e.target.files?.[0] ?? null)}
                      className="block w-full text-xs text-white/70 file:mr-3 file:rounded-xl file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-semibold file:text-zinc-900 hover:file:bg-white/90"
                    />
                    <div className="mt-1 text-xs text-white/45">Maks 5MB. JPG/PNG/WebP.</div>
                  </div>
                </div>

                {file ? (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={clearFile}
                      className="h-9 rounded-2xl bg-black/30 px-4 text-xs text-white/80 ring-1 ring-white/10 hover:bg-black/40"
                    >
                      Batal pilih gambar
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={saveProfile}
                  disabled={saving}
                  className="h-10 rounded-2xl bg-white px-4 text-sm font-semibold text-zinc-950 hover:bg-white/90 disabled:opacity-60"
                >
                  {saving ? "Menyimpan…" : "Simpan perubahan"}
                </button>

                <button
                  type="button"
                  onClick={resetAvatarToSocial}
                  disabled={saving || (!customAvatarUrl && !file)}
                  className="h-10 rounded-2xl bg-white/10 px-4 text-sm text-white/85 ring-1 ring-white/10 hover:bg-white/15 disabled:opacity-50"
                  title="Hapus avatar custom (balik ke avatar sosmed jika ada)"
                >
                  Reset avatar
                </button>
              </div>

              <div className="rounded-2xl bg-black/20 px-4 py-3 text-xs text-white/55 ring-1 ring-white/10">
                <div className="font-semibold text-white/70">Prioritas Avatar</div>
                <ol className="mt-2 list-decimal space-y-1 pl-4">
                  <li>Avatar custom yang kamu upload (kalau ada)</li>
                  <li>Avatar dari Google/Discord (kalau login via sosmed)</li>
                  <li>Avatar kosong (placeholder)</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
