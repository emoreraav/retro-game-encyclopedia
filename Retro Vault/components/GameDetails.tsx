import type { GameDetail } from "@/types/game";
import MediaGallery from "./MediaGallery";
import PurchaseLinks from "./PurchaseLinks";
import FavoriteButton from "./FavoriteButton";
import { Calendar, Users, Building2 } from "lucide-react";

export default function GameDetails({ game }: { game: GameDetail }) {
  const year = game.releaseDate ? new Date(game.releaseDate).getFullYear() : "—";

  return (
    <article className="max-w-5xl mx-auto px-4 pb-24">
      {/* 1. Encabezado */}
      <header className="pt-10 pb-6 border-b border-carbon-700">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="stat-mono text-phosphor mb-2">
              #{String(game.id).padStart(5, "0")} · {game.genres.join(" / ")}
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-white">{game.title}</h1>
            <p className="mt-3 text-slate-400 flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Building2 size={14} /> {game.developers.join(", ") || "Desarrollador desconocido"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={14} /> {year}
              </span>
              {game.ageRating && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-carbon-600 stat-mono text-amber">
                  {game.ageRating.system} {game.ageRating.label}
                </span>
              )}
            </p>
          </div>
          <FavoriteButton gameId={game.id} />
        </div>
      </header>

      {/* 3. Galería multimedia (screenshots + trailer) */}
      <section className="mt-8">
        <MediaGallery screenshots={game.screenshots} trailerUrl={game.trailerUrl} />
      </section>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Descripción + metadatos */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Sinopsis</h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line">
              {game.description || "Descripción no disponible todavía."}
            </p>
          </section>

          {/* 2. Metadatos: géneros/etiquetas, modos de juego */}
          <section className="cartridge-panel p-5">
            <h2 className="stat-mono text-phosphor mb-3">Ficha técnica</h2>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <Field label="Géneros" value={game.genres.join(", ") || "—"} />
              <Field label="Etiquetas" value={game.tags.slice(0, 5).join(", ") || "—"} />
              <Field
                label="Modos de juego"
                value={game.gameModes.join(", ")}
                icon={<Users size={13} />}
              />
              <Field label="Publisher" value={game.publishers.join(", ") || "—"} />
              <Field label="Metacritic" value={game.metacritic ? String(game.metacritic) : "—"} />
              <Field label="Clasificación" value={game.ageRating?.label ?? "Sin clasificar"} />
            </dl>
          </section>

          {/* 4. Plataformas disponibles */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Plataformas históricas</h2>
            <div className="flex flex-wrap gap-2">
              {game.platforms.map((p) => (
                <span
                  key={p}
                  className="px-3 py-1.5 rounded-md bg-carbon-800 border border-carbon-600 text-sm text-slate-200"
                >
                  {p}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* 5 y 6. Dónde comprar hoy + enlaces oficiales */}
        <aside className="lg:col-span-1">
          <PurchaseLinks storeLinks={game.storeLinks} officialLinks={game.officialLinks} />
        </aside>
      </div>
    </article>
  );
}

function Field({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <dt className="stat-mono mb-1 inline-flex items-center gap-1.5">
        {icon}
        {label}
      </dt>
      <dd className="text-slate-200">{value}</dd>
    </div>
  );
}
