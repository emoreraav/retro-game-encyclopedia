// Modelo normalizado que usa toda la app, independiente de si el dato
// viene de RAWG, IGDB o (a futuro) una fuente mixta. Así, cambiar de
// proveedor solo implica reescribir el "mapper" en lib/rawg.ts.

export interface GameSummary {
  id: number;
  slug: string;
  title: string;
  coverUrl: string | null;
  releaseYear: number | null;
  platforms: string[]; // nombres cortos: "NES", "PS2", "PC"...
  rating: number | null; // 0-5
}

export interface Screenshot {
  id: number;
  url: string;
}

export interface AgeRating {
  system: "ESRB" | "PEGI" | "USK" | "Otro";
  label: string; // "M", "18", etc.
}

export interface StoreLink {
  store:
    | "Steam"
    | "Epic Games Store"
    | "GOG"
    | "PlayStation Store"
    | "Xbox Store"
    | "Nintendo eShop"
    | "Amazon Luna"
    | "Xbox Cloud Gaming"
    | "GeForce Now";
  url: string;
  category: "pc" | "console" | "cloud";
}

export interface OfficialLink {
  label: string; // "Sitio del desarrollador", "Publisher"
  url: string;
}

export interface GameDetail {
  id: number;
  slug: string;
  title: string;
  description: string;
  coverUrl: string | null;
  releaseDate: string | null; // ISO
  developers: string[];
  publishers: string[];
  genres: string[];
  tags: string[];
  gameModes: string[]; // "Single-player", "Co-op", "Multiplayer"
  platforms: string[];
  ageRating: AgeRating | null;
  screenshots: Screenshot[];
  trailerUrl: string | null; // embed de YouTube si existe
  metacritic: number | null;
  storeLinks: StoreLink[];
  officialLinks: OfficialLink[];
}
