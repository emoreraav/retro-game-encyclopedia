"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { Search } from "lucide-react";

const DECADES = ["1980", "1990", "2000", "2010", "2020"];
const GENRES = [
  { slug: "action", label: "Acción" },
  { slug: "role-playing-games-rpg", label: "RPG" },
  { slug: "shooter", label: "Shooter" },
  { slug: "platformer", label: "Plataformas" },
  { slug: "strategy", label: "Estrategia" },
  { slug: "sports", label: "Deportes" },
];

export default function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [isPending, startTransition] = useTransition();

  // Buscador predictivo con debounce de 300ms
  useEffect(() => {
    const handle = setTimeout(() => {
      updateParam("q", query || null);
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por título… (ej. Chrono Trigger, Halo, Elden Ring)"
          className="w-full pl-10 pr-4 py-3 rounded-md bg-carbon-800 border border-carbon-600
                     text-white placeholder:text-slate-500 focus:border-phosphor outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="stat-mono self-center mr-1">Década:</span>
        {DECADES.map((d) => (
          <Chip
            key={d}
            active={searchParams.get("decade") === d}
            onClick={() => updateParam("decade", searchParams.get("decade") === d ? null : d)}
          >
            {d}s
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="stat-mono self-center mr-1">Género:</span>
        {GENRES.map((g) => (
          <Chip
            key={g.slug}
            active={searchParams.get("genre") === g.slug}
            onClick={() =>
              updateParam("genre", searchParams.get("genre") === g.slug ? null : g.slug)
            }
          >
            {g.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
        active
          ? "bg-phosphor/15 border-phosphor text-phosphor"
          : "border-carbon-600 text-slate-300 hover:border-slate-400"
      }`}
    >
      {children}
    </button>
  );
}
