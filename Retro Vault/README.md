# 🕹️ RetroVault — Enciclopedia Global de Videojuegos

Web app en Next.js 14 (App Router) + TypeScript + Tailwind CSS que cataloga videojuegos desde los 80s hasta hoy, con fichas ultra-detalladas y links de compra/juego actuales.

## Decisión de stack (y por qué)

| Capa | Elección | Motivo |
|---|---|---|
| Framework | **Next.js 14 (App Router)** | SSR/SSG para SEO de fichas de juego, rutas dinámicas `/game/[slug]`, Server Components para no exponer la API key en el cliente. |
| Estilos | **Tailwind CSS** + componentes propios estilo shadcn | Control total del "look gamer" sin peso extra de librerías UI genéricas. |
| Datos de juegos | **RAWG API** (recomendado sobre IGDB) | IGDB exige autenticación OAuth vía Twitch (client credentials que expiran y se renuevan), es más potente pero más pesado de mantener. RAWG usa una sola API key estática, tiene +500k juegos desde los 80s, screenshots, trailers, tiendas y metacritic ya normalizados. Para un catálogo global es la relación esfuerzo/cobertura más rápida de lanzar. Se deja `lib/igdb.ts` como stub por si luego quieres migrar o combinar ambas fuentes. |
| Auth + Favoritos | **Supabase** (Postgres + Auth) | Login social rápido, tabla `favorites` con RLS por usuario, y fallback a `localStorage` si el usuario no está logueado. |
| Video/trailers | **YouTube IFrame embed** | RAWG no aloja video propio; se busca `"{juego} official trailer"` vía YouTube Data API o se usa el campo `clip` de RAWG cuando existe. |

## Estructura de archivos

```
retro-game-encyclopedia/
├── app/
│   ├── layout.tsx                # Layout raíz, dark mode por defecto, fuentes
│   ├── globals.css               # Tailwind + tokens de diseño (CRT/neón)
│   ├── page.tsx                  # Home: buscador + filtros + grid
│   ├── game/
│   │   └── [slug]/
│   │       └── page.tsx          # Ficha detallada (Server Component, fetch RAWG)
│   └── api/
│       └── games/route.ts        # (opcional) proxy para no exponer la key en el cliente
├── components/
│   ├── GameCard.tsx              # Tarjeta del grid
│   ├── GameDetails.tsx           # Componente principal de la ficha
│   ├── MediaGallery.tsx          # Carrusel screenshots + trailer embed
│   ├── PurchaseLinks.tsx         # Bloque "Dónde jugar / comprar hoy"
│   ├── PlatformIcons.tsx         # Iconos de plataformas históricas
│   ├── FilterBar.tsx             # Filtros: década, género, plataforma, edad
│   └── FavoriteButton.tsx        # Toggle "Quiero jugarlo" / "Completado"
├── lib/
│   ├── rawg.ts                   # Cliente RAWG + mapeo de datos
│   ├── igdb.ts                   # Stub alternativo (OAuth Twitch)
│   ├── storefronts.ts            # Generador de links de tienda por plataforma
│   └── supabase.ts               # Cliente Supabase
├── types/
│   └── game.ts                   # Tipos normalizados de la app (Game, Screenshot, Store…)
├── .env.local.example
├── tailwind.config.ts
└── package.json
```

## Setup

```bash
npx create-next-app@latest retro-game-encyclopedia --typescript --tailwind --app
cd retro-game-encyclopedia
npm install @supabase/supabase-js clsx lucide-react embla-carousel-react
```

Copia los archivos de este proyecto sobre el scaffold generado, luego:

```bash
cp .env.local.example .env.local
# rellena tu API key de RAWG (gratis en https://rawg.io/apidocs)
npm run dev
```

## Siguientes pasos sugeridos (roadmap)

1. Conectar Supabase Auth (magic link) + tabla `favorites (user_id, game_id, status)`.
2. Implementar `app/api/games/route.ts` como proxy con caché (`revalidate: 3600`) para no golpear el rate limit de RAWG en cada búsqueda.
3. Añadir buscador predictivo con `useDeferredValue` + debounce (300ms) contra `/api/games?search=`.
4. Scroll infinito en el grid con `IntersectionObserver` + paginación `page`/`page_size` de RAWG.
5. Mapear `stores` de RAWG (que da la tienda genérica) a URLs de búsqueda directa por título en Steam/Epic/GOG/PSN/eShop (ver `lib/storefronts.ts`).
