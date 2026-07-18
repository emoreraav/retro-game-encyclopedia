// Cliente de IGDB — se usa SOLO para traer la carátula oficial (cover art),
// mientras que toda la demás información (descripción, tiendas, screenshots,
// géneros...) sigue viniendo de RAWG en lib/rawg.ts.
//
// IGDB requiere autenticarse contra Twitch con "client credentials" para
// obtener un token temporal (dura ~60 días) antes de poder consultar su API.

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

// Cacheamos el token en memoria del proceso del servidor para no pedir uno
// nuevo en cada request (Twitch limita cuántos tokens puedes generar).
let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.value;
  }

  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
    throw new Error(
      "Faltan TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET — ver .env.local.example"
    );
  }

  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
    { method: "POST" }
  );

  if (!res.ok) {
    throw new Error(`Twitch OAuth error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  cachedToken = {
    value: data.access_token,
    // Restamos 5 minutos de margen antes de que expire de verdad
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  };
  return cachedToken.value;
}

/**
 * Recibe una lista de títulos de juego y devuelve un Map con la carátula
 * oficial de IGDB para los que encontró match, en UNA sola petición
 * (usando el endpoint /multiquery de IGDB, en vez de una llamada por juego).
 * Los títulos no encontrados simplemente no aparecen en el Map — quien
 * llame a esta función debe hacer fallback a otra imagen en ese caso.
 */
export async function getIgdbCoversByTitles(
  titles: string[]
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (titles.length === 0) return result;
  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) return result; // sin credenciales, no hay covers

  const token = await getAccessToken();

  // Construye una multiquery: una sub-consulta por título, cada una
  // buscando el juego por nombre y pidiendo solo el campo de la carátula.
  const body = titles
    .map(
      (title, i) => `query games "cover_${i}" {
  search "${escapeQuery(title)}";
  fields name,cover.image_id;
  limit 1;
};`
    )
    .join("\n");

  const res = await fetch("https://api.igdb.com/v4/multiquery", {
    method: "POST",
    headers: {
      "Client-ID": TWITCH_CLIENT_ID,
      Authorization: `Bearer ${token}`,
    },
    body,
    // Las carátulas cambian poco; cache 24h
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    console.warn(`[igdb] multiquery error ${res.status}: ${await res.text()}`);
    return result;
  }

  const data: Array<{ name: string; result: any[] }> = await res.json();

  for (const entry of data) {
    const game = entry.result?.[0];
    const imageId = game?.cover?.image_id;
    if (game?.name && imageId) {
      // t_cover_big = ~264x374px, buena calidad para tarjetas y fichas
      const url = `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}.jpg`;
      result.set(game.name.toLowerCase(), url);
    }
  }

  return result;
}

function escapeQuery(title: string): string {
  return title.replace(/"/g, '\\"');
}
