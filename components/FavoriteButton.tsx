"use client";

import { useEffect, useState } from "react";
import { Heart, CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import { supabaseBrowser } from "@/lib/supabase";

type Status = "none" | "want" | "completed";
const STORAGE_KEY = "retrovault:favorites";

export default function FavoriteButton({ gameId }: { gameId: number }) {
  const [status, setStatus] = useState<Status>("none");
  const [userId, setUserId] = useState<string | null>(null);

  // Al montar: mira si hay sesión activa. Si la hay, trae el estado desde
  // Supabase; si no, usa lo que haya guardado en localStorage.
  useEffect(() => {
    supabaseBrowser.auth.getSession().then(async ({ data }) => {
      const uid = data.session?.user.id ?? null;
      setUserId(uid);

      if (uid) {
        const { data: fav } = await supabaseBrowser
          .from("favorites")
          .select("status")
          .eq("user_id", uid)
          .eq("game_id", gameId)
          .maybeSingle();
        setStatus((fav?.status as Status) ?? "none");
      } else {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
        setStatus(stored[gameId] ?? "none");
      }
    });
  }, [gameId]);

  async function updateStatus(next: Status) {
    setStatus(next); // respuesta visual inmediata

    if (userId) {
      if (next === "none") {
        await supabaseBrowser.from("favorites").delete().eq("user_id", userId).eq("game_id", gameId);
      } else {
        await supabaseBrowser
          .from("favorites")
          .upsert({ user_id: userId, game_id: gameId, status: next });
      }
    } else {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
      if (next === "none") delete stored[gameId];
      else stored[gameId] = next;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex gap-2">
        <button
          onClick={() => updateStatus(status === "want" ? "none" : "want")}
          className={clsx(
            "inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm border transition-colors",
            status === "want"
              ? "bg-arcade/15 border-arcade text-arcade"
              : "border-carbon-600 text-slate-300 hover:border-arcade"
          )}
        >
          <Heart size={15} fill={status === "want" ? "currentColor" : "none"} />
          Quiero jugarlo
        </button>
        <button
          onClick={() => updateStatus(status === "completed" ? "none" : "completed")}
          className={clsx(
            "inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm border transition-colors",
            status === "completed"
              ? "bg-phosphor/15 border-phosphor text-phosphor"
              : "border-carbon-600 text-slate-300 hover:border-phosphor"
          )}
        >
          <CheckCircle2 size={15} fill={status === "completed" ? "currentColor" : "none"} />
          Completado
        </button>
      </div>
      {!userId && (
        <p className="text-xs text-slate-500">
          Sin iniciar sesión, esto solo se guarda en este navegador.
        </p>
      )}
    </div>
  );
}
