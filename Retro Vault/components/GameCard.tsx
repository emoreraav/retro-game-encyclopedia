import Link from "next/link";
import Image from "next/image";
import type { GameSummary } from "@/types/game";
import { Star } from "lucide-react";

export default function GameCard({ game }: { game: GameSummary }) {
  return (
    <Link
      href={`/game/${game.slug}`}
      className="cartridge-panel group block hover:-translate-y-1 hover:shadow-phosphor-glow transition-all duration-200"
    >
      <div className="relative aspect-[3/4] bg-carbon-700">
        {game.coverUrl ? (
          <Image
            src={game.coverUrl}
            alt={game.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center stat-mono">
            Sin portada
          </div>
        )}
        {game.rating != null && (
          <span className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-carbon-950/80 text-amber text-xs font-mono">
            <Star size={11} fill="currentColor" /> {game.rating.toFixed(1)}
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm text-white truncate group-hover:text-phosphor">
          {game.title}
        </h3>
        <p className="stat-mono mt-1">
          {game.releaseYear ?? "—"} · {game.platforms.slice(0, 2).join(", ") || "—"}
        </p>
      </div>
    </Link>
  );
}
