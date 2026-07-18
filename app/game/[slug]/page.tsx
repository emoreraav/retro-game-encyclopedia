import { searchGames } from "@/lib/rawg";
import GameCard from "@/components/GameCard";
import FilterBar from "@/components/FilterBar";

interface Props {
  searchParams: {
    q?: string;
    decade?: string; // "1980" | "1990" | "2000" | "2010" | "2020"
    genre?: string;
    page?: string;
  };
}

const DECADE_RANGES: Record<string, string> = {
  "1980": "1980-01-01,1989-12-31",
  "1990": "1990-01-01,1999-12-31",
  "2000": "2000-01-01,2009-12-31",
  "2010": "2010-01-01,2019-12-31",
  "2020": "2020-01-01,2029-12-31",
};

export default async function HomePage({ searchParams }: Props) {
  const page = Number(searchParams.page ?? 1);
  const { results, count, hasNext } = await searchGames({
    search: searchParams.q,
    genres: searchParams.genre,
    dates: searchParams.decade ? DECADE_RANGES[searchParams.decade] : undefined,
    page,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Explora el catálogo</h1>
        <p className="text-slate-400 mt-1">{count.toLocaleString("es-ES")} juegos indexados</p>
      </header>

      <FilterBar />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
        {results.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      {results.length === 0 && (
        <p className="text-center text-slate-500 py-20">
          Ningún juego coincide con tu búsqueda. Prueba con otros filtros.
        </p>
      )}

      {/* Paginación simple; puede sustituirse por scroll infinito con IntersectionObserver */}
      <div className="flex justify-center gap-3 mt-10">
        {page > 1 && (
          <a href={`?${buildQuery(searchParams, page - 1)}`} className="btn-store">
            ← Anterior
          </a>
        )}
        {hasNext && (
          <a href={`?${buildQuery(searchParams, page + 1)}`} className="btn-store">
            Siguiente →
          </a>
        )}
      </div>
    </div>
  );
}

function buildQuery(params: Props["searchParams"], page: number) {
  const usp = new URLSearchParams({ ...params, page: String(page) } as Record<string, string>);
  return usp.toString();
}
