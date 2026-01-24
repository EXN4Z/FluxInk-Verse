// app/layout.tsx
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="hide-scrollbar">
      <body className="min-h-screen bg-zinc-950 text-white hide-scrollbar">
        {children}
      </body>
    </html>
  );
}
