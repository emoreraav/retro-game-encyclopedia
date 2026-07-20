import type { Metadata } from "next";
import "./globals.css";
import AuthWidget from "@/components/AuthWidget";

export const metadata: Metadata = {
  title: "RetroVault — Enciclopedia de videojuegos",
  description: "Explora videojuegos desde los 80s hasta hoy: fichas detalladas y dónde comprarlos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="dark">
      <body>
        <nav className="border-b border-carbon-700 bg-carbon-900/80 backdrop-blur sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="font-display font-bold text-lg text-white">
              Retro<span className="text-phosphor">Vault</span>
            </a>
            <AuthWidget />
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
