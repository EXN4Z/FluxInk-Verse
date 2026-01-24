// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-[100dvh] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative flex h-full items-center justify-center px-6">
        {children}
      </div>
    </div>
  );
}
