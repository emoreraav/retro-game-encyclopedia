import type { GameDetail, GameSummary, Screenshot, StoreLink } from "@/types/game";
import { buildStoreLinks } from "./storefronts";
import { getIgdbCoversByTitles } from "./igdb";
import { translateToSpanish } from "./translate";

const RAWG_BASE = "https://api.rawg.io/api";
const API_KEY = process.env.RAWG_API_KEY; // server-only, nunca NEXT_PUBLIC_

if (!API_KEY && process.env.NODE_ENV !== "test") {
  console.warn("[rawg] Falta RAWG_API_KEY en .env.local — ver .env.local.example");
}

async function rawgFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${RAWG_BASE}${path}`);
  url.searchParams.set("key", API_KEY ?? "");
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    // cachea listados 1h; las fichas de detalle se pueden cachear más tiempo (cambian poco)
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`RAWG API error ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

// ---------- Búsqueda / listado (Home) ----------

export interface SearchGamesParams {
  search?: string;
  page?: number;
  pageSize?: number;
  genres?: string; // slugs separados por coma: "shooter,rpg"
  platforms?: string; // ids separados por coma
  dates?: string; // "1990-01-01,1999-12-31" para filtrar por década
  ordering?: string; // "-rating", "-released"
}

export async function searchGames(params: SearchGamesParams): Promise<{
  results: GameSummary[];
  count: number;
  hasNext: boolean;
}> {
  const data = await rawgFetch<any>("/games", {
    ...(params.search ? { search: params.search, search_precise: "true" } : {}),
    page: String(params.page ?? 1),
    page_size: String(params.pageSize ?? 20),
    ...(params.genres ? { genres: params.genres } : {}),
    ...(params.platforms ? { platforms: params.platforms } : {}),
    ...(params.dates ? { dates: params.dates } : {}),
    ordering: params.ordering ?? "-rating",
  });

  const summaries = data.results.map(mapSummary);

  // Sustituye la imagen de RAWG (a veces un screenshot cualquiera) por la
  // carátula oficial de IGDB cuando exista match. Si IGDB falla o no
  // encuentra el juego, se queda con la imagen de RAWG como respaldo.
  try {
    const covers = await getIgdbCoversByTitles(summaries.map((s: GameSummary) => s.title));
    summaries.forEach((s: GameSummary) => {
      const officialCover = covers.get(s.title.toLowerCase());
      if (officialCover) s.coverUrl = officialCover;
    });
  } catch (err) {
    console.warn("[igdb] No se pudieron obtener carátulas oficiales:", err);
  }

  return {
    count: data.count,
    hasNext: Boolean(data.next),
    results: summaries,
  };
}

function mapSummary(g: any): GameSummary {
  return {
    id: g.id,
    slug: g.slug,
    title: g.name,
    coverUrl: g.background_image ?? null,
    releaseYear: g.released ? new Date(g.released).getFullYear() : null,
    platforms: (g.platforms ?? []).map((p: any) => p.platform.name),
    rating: g.rating ?? null,
  };
}

// ---------- Ficha detallada ----------

export async function getGameBySlug(slug: string): Promise<GameDetail> {
  const [detail, screenshotsRes, storesRes] = await Promise.all([
    rawgFetch<any>(`/games/${slug}`),
    rawgFetch<any>(`/games/${slug}/screenshots`),
    rawgFetch<any>(`/games/${slug}/stores`),
  ]);

  const screenshots: Screenshot[] = screenshotsRes.results.map((s: any) => ({
    id: s.id,
    url: s.image,
  }));

  // RAWG da la tienda genérica (ej. "Steam") + la URL real de la ficha en esa tienda.
  const rawStoreLinks: StoreLink[] = storesRes.results
    .map((s: any) => mapStoreToLink(s.store?.name, s.url))
    .filter(Boolean) as StoreLink[];

  // Para tiendas que RAWG no cubre (PSN, eShop, cloud gaming) generamos
  // un link de búsqueda directo por título — ver lib/storefronts.ts
  const fallbackLinks = buildStoreLinks(detail.name, rawStoreLinks.map((l) => l.store));

  let coverUrl: string | null = detail.background_image ?? null;
  try {
    const covers = await getIgdbCoversByTitles([detail.name]);
    const officialCover = covers.get(detail.name.toLowerCase());
    if (officialCover) coverUrl = officialCover;
  } catch (err) {
    console.warn("[igdb] No se pudo obtener la carátula oficial:", err);
  }

  const description = await translateToSpanish(stripHtml(detail.description));

  return {
    id: detail.id,
    slug: detail.slug,
    title: detail.name,
    description,
    coverUrl,
    releaseDate: detail.released,
    developers: (detail.developers ?? []).map((d: any) => d.name),
    publishers: (detail.publishers ?? []).map((p: any) => p.name),
    genres: (detail.genres ?? []).map((g: any) => g.name),
    tags: (detail.tags ?? []).slice(0, 10).map((t: any) => t.name),
    gameModes: mapGameModes(detail.tags ?? []),
    platforms: (detail.platforms ?? []).map((p: any) => p.platform.name),
    ageRating: detail.esrb_rating
      ? { system: "ESRB", label: detail.esrb_rating.name }
      : null,
    screenshots,
    trailerUrl: detail.clip?.clip ?? null,
    metacritic: detail.metacritic ?? null,
    storeLinks: [...rawStoreLinks, ...fallbackLinks],
    officialLinks: [
      ...(detail.website ? [{ label: "Sitio oficial", url: detail.website }] : []),
    ],
  };
}

function mapGameModes(tags: any[]): string[] {
  const modeMap: Record<string, string> = {
    singleplayer: "Un jugador",
    "co-op": "Cooperativo",
    multiplayer: "Multijugador",
  };
  const found = tags
    .map((t) => modeMap[t.slug])
    .filter(Boolean);
  return found.length ? Array.from(new Set(found)) : ["Un jugador"];
}

function mapStoreToLink(name: string, url: string): StoreLink | null {
  const known: Record<string, { store: StoreLink["store"]; category: StoreLink["category"] }> = {
    Steam: { store: "Steam", category: "pc" },
    "Epic Games": { store: "Epic Games Store", category: "pc" },
    GOG: { store: "GOG", category: "pc" },
    PlayStation: { store: "PlayStation Store", category: "console" },
    Xbox: { store: "Xbox Store", category: "console" },
    "Nintendo Store": { store: "Nintendo eShop", category: "console" },
  };
  const match = Object.keys(known).find((k) => name?.includes(k));
  if (!match) return null;
  return { url, ...known[match] };
}

function stripHtml(html: string | undefined): string {
  return (html ?? "").replace(/<[^>]*>/g, "").trim();
}
