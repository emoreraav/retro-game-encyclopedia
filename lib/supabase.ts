import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Cliente para usar en componentes de cliente ("use client").
// Usamos la clave pública (anon/publishable) — es segura de exponer en el
// navegador siempre que la tabla tenga Row Level Security activada, que es
// justo lo que configuramos en el SQL de la tabla `favorites`.
export const supabaseBrowser = createClient(supabaseUrl, supabaseKey);
