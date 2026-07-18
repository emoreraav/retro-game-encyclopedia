"use client";

import { useState } from "react";
import Image from "next/image";
import type { Screenshot } from "@/types/game";
import { Play, X } from "lucide-react";

export default function MediaGallery({
  screenshots,
  trailerUrl,
}: {
  screenshots: Screenshot[];
  trailerUrl: string | null;
}) {
  const [active, setActive] = useState<Screenshot | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  return (
    <div>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin">
        {trailerUrl && (
          <button
            onClick={() => setShowTrailer(true)}
            className="relative shrink-0 w-72 h-40 rounded-md overflow-hidden snap-start
                       border border-carbon-600 group"
          >
            <div className="absolute inset-0 bg-carbon-950/60 flex items-center justify-center">
              <span className="w-12 h-12 rounded-full bg-phosphor/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play size={20} className="text-carbon-950 ml-0.5" fill="currentColor" />
              </span>
            </div>
            <span className="absolute bottom-2 left-2 stat-mono text-white">Tráiler</span>
          </button>
        )}

        {screenshots.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s)}
            className="relative shrink-0 w-72 h-40 rounded-md overflow-hidden snap-start
                       border border-carbon-600 hover:border-phosphor transition-colors"
          >
            <Image src={s.url} alt="Captura de pantalla" fill className="object-cover" sizes="288px" />
          </button>
        ))}

        {screenshots.length === 0 && !trailerUrl && (
          <p className="text-sm text-slate-500 py-10">No hay material multimedia disponible.</p>
        )}
      </div>

      {/* Lightbox screenshot */}
      {active && (
        <Lightbox onClose={() => setActive(null)}>
          <Image
            src={active.url}
            alt="Captura ampliada"
            width={1280}
            height={720}
            className="rounded-md w-full h-auto"
          />
        </Lightbox>
      )}

      {/* Lightbox trailer (embed YouTube) */}
      {showTrailer && trailerUrl && (
        <Lightbox onClose={() => setShowTrailer(false)}>
          <div className="aspect-video w-full max-w-3xl">
            <video src={trailerUrl} controls autoPlay className="w-full h-full rounded-md" />
          </div>
        </Lightbox>
      )}
    </div>
  );
}

function Lightbox({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-carbon-950/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-slate-300 hover:text-white"
        onClick={onClose}
        aria-label="Cerrar"
      >
        <X size={28} />
      </button>
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}
