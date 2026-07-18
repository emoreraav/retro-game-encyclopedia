"use client";

import { useEffect, useState } from "react";
import { Heart, CheckCircle2 } from "lucide-react";
import clsx from "clsx";

type Status = "none" | "want" | "completed";
const STORAGE_KEY = "retrovault:favorites";

export default function FavoriteButton({ gameId }: { gameId: number }) {
  const [status, setStatus] = useState<Status>("none");

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    setStatus(stored[gameId] ?? "none");
  }, [gameId]);

  function updateStatus(next: Status) {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    if (next === "none") {
      delete stored[gameId];
    } else {
      stored[gameId] = next;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    setStatus(next);
    // TODO: si hay sesión Supabase activa, hacer upsert en la tabla `favorites`
    // en lugar de (o además de) localStorage.
  }

  return (
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
  );
}
