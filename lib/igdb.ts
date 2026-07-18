// Cliente de IGDB — se usa SOLO para traer la carátula oficial (cover art),
// mientras que toda la demás información (descripción, tiendas, screenshots,
// géneros...) sigue viniendo de RAWG en lib/rawg.ts.
//
// IGDB requiere autenticarse contra Twitch con "client credentials" para
// obtener un token temporal (dura ~60 días) antes de poder consultar su API.
//
// NOTA: inicialmente esto usaba el endpoint /multiquery para pedir todas las
// carátulas en una sola petición, pero IGDB tiene un bug conocido donde
// combinar "search" dentro de una multiquery devuelve resultados vacíos.
// Por eso aquí hacemos una petición individual por título, en paralelo
// pero limitando cuántas van a la vez para no saturar el rate limit de IGDB
// (~4 peticiones/segundo por Client ID).

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

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
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  };
  return cachedToken.value;
}

async function fetchCoverForTitle(
  title: string,
  token: string
): Promise<{ title: string; coverUrl: string | null }> {
  try {
    const res = await fetch("https://api.igdb.com/v4/games", {
      method: "POST",
      headers: {
        "Client-ID": TWITCH_CLIENT_ID as string,
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: `search "${escapeQuery(title)}"; fields name,cover.image_id; limit 1;`,
      next: { revalidate: 86400 }, // las carátulas cambian poco; cache 24h
    });

    if (!res.ok) {
      console.warn(`[igdb] Error ${res.status} buscando "${title}": ${await res.text()}`);
      return { title, coverUrl: null };
    }

    const results = await res.json();
    const imageId = results?.[0]?.cover?.image_id;
    if (!imageId) return { title, coverUrl: null };

    // t_cover_big = ~264x374px, buena calidad para tarjetas y fichas
    return {
      title,
      coverUrl: `https://images.igdb.com/igdb/image/upload/t_cover_big/${imageId}.jpg`,
    };
  } catch (err) {
    console.warn(`[igdb] Excepción buscando "${title}":`, err);
    return { title, coverUrl: null };
  }
}

/**
 * Recibe una lista de títulos de juego y devuelve un Map con la carátula
 * oficial de IGDB para los que encontró match. Los títulos no encontrados
 * simplemente no aparecen en el Map — quien llame a esta función debe
 * hacer fallback a otra imagen en ese caso.
 */
export async function getIgdbCoversByTitles(
  titles: string[]
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  if (titles.length === 0) return result;
  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
    console.warn("[igdb] Faltan TWITCH_CLIENT_ID/TWITCH_CLIENT_SECRET, se omiten carátulas oficiales");
    return result;
  }

  const token = await getAccessToken();

  // Concurrencia limitada a 4 a la vez para respetar el rate limit de IGDB
  const CONCURRENCY = 4;
  const queue = [...titles];
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length > 0) {
      const title = queue.shift();
      if (!title) break;
      const { coverUrl } = await fetchCoverForTitle(title, token);
      if (coverUrl) result.set(title.toLowerCase(), coverUrl);
    }
  });
  await Promise.all(workers);

  console.log(`[igdb] Carátulas encontradas: ${result.size} de ${titles.length} títulos buscados`);
  return result;
}

function escapeQuery(title: string): string {
  return title.replace(/"/g, '\\"');
}
