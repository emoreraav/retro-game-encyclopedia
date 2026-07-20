// Traduce la descripción del juego (que RAWG a veces devuelve en inglés,
// ruso, chino...) al español, usando Claude Haiku por ser rápido y barato
// para una tarea de traducción simple.

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY?.trim();

export async function translateToSpanish(text: string): Promise<string> {
  if (!text.trim()) return text;
  if (!ANTHROPIC_API_KEY) {
    console.warn("[translate] Falta ANTHROPIC_API_KEY, se muestra el texto sin traducir");
    return text;
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system:
          "Traduces descripciones de videojuegos al español de España. " +
          "Devuelve SOLO la traducción, sin comentarios ni comillas. " +
          "Si el texto ya está en español, devuélvelo tal cual (puedes pulir errores obvios).",
        messages: [{ role: "user", content: text }],
      }),
      // Traducciones no cambian; cachea 30 días
      next: { revalidate: 2592000 },
    });

    if (!res.ok) {
      console.warn(`[translate] Error ${res.status}: ${await res.text()}`);
      return text;
    }

    const data = await res.json();
    const translated = data.content?.[0]?.text;
    return translated?.trim() || text;
  } catch (err) {
    console.warn("[translate] Excepción traduciendo:", err);
    return text;
  }
}
