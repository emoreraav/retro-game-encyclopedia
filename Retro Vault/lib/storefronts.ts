import type { StoreLink } from "@/types/game";

// RAWG solo devuelve URL directa para Steam/Epic/GOG/PSN/Xbox/Nintendo cuando
// existe una ficha enlazada en su base. Para el resto (o cuando falta),
// generamos un link de búsqueda directa por título dentro de cada tienda,
// incluyendo cloud gaming, que RAWG no cubre en absoluto.
const SEARCH_BUILDERS: Array<{
  store: StoreLink["store"];
  category: StoreLink["category"];
  build: (title: string) => string;
}> = [
  {
    store: "Amazon Luna",
    category: "cloud",
    build: (t) => `https://www.amazon.com/luna/search?q=${encodeURIComponent(t)}`,
  },
  {
    store: "Xbox Cloud Gaming",
    category: "cloud",
    build: (t) =>
      `https://www.xbox.com/es-ES/games/all-games?xr=shellnav&q=${encodeURIComponent(t)}`,
  },
  {
    store: "GeForce Now",
    category: "cloud",
    build: (t) => `https://www.nvidia.com/es-es/geforce-now/games/?search=${encodeURIComponent(t)}`,
  },
  {
    store: "PlayStation Store",
    category: "console",
    build: (t) => `https://store.playstation.com/es-es/search/${encodeURIComponent(t)}`,
  },
  {
    store: "Xbox Store",
    category: "console",
    build: (t) => `https://www.xbox.com/es-ES/games/store/search?q=${encodeURIComponent(t)}`,
  },
  {
    store: "Nintendo eShop",
    category: "console",
    build: (t) => `https://www.nintendo.com/es-es/search/?q=${encodeURIComponent(t)}`,
  },
];

/**
 * Devuelve links de búsqueda para las tiendas que aún no están cubiertas
 * por `alreadyCovered` (las que sí trajo RAWG con URL directa).
 */
export function buildStoreLinks(title: string, alreadyCovered: string[]): StoreLink[] {
  return SEARCH_BUILDERS.filter((b) => !alreadyCovered.includes(b.store)).map((b) => ({
    store: b.store,
    category: b.category,
    url: b.build(title),
  }));
}
