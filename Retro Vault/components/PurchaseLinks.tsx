import type { StoreLink, OfficialLink } from "@/types/game";
import { ExternalLink, Monitor, Gamepad2, Cloud } from "lucide-react";

const GROUP_LABELS: Record<StoreLink["category"], { label: string; icon: React.ReactNode }> = {
  pc: { label: "PC", icon: <Monitor size={14} /> },
  console: { label: "Consolas", icon: <Gamepad2 size={14} /> },
  cloud: { label: "Cloud Gaming", icon: <Cloud size={14} /> },
};

export default function PurchaseLinks({
  storeLinks,
  officialLinks,
}: {
  storeLinks: StoreLink[];
  officialLinks: OfficialLink[];
}) {
  const grouped = (["pc", "console", "cloud"] as const).map((cat) => ({
    cat,
    links: storeLinks.filter((s) => s.category === cat),
  }));

  return (
    <div className="cartridge-panel p-5 sticky top-6 space-y-6">
      <div>
        <h2 className="stat-mono text-phosphor mb-3">Dónde jugar hoy</h2>
        <div className="space-y-4">
          {grouped.map(
            ({ cat, links }) =>
              links.length > 0 && (
                <div key={cat}>
                  <p className="text-xs text-slate-400 mb-2 inline-flex items-center gap-1.5">
                    {GROUP_LABELS[cat].icon} {GROUP_LABELS[cat].label}
                  </p>
                  <div className="flex flex-col gap-2">
                    {links.map((l) => (
                      <a
                        key={l.store}
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-store justify-between"
                      >
                        {l.store}
                        <ExternalLink size={14} className="opacity-60" />
                      </a>
                    ))}
                  </div>
                </div>
              )
          )}
          {storeLinks.length === 0 && (
            <p className="text-sm text-slate-500">
              Sin tiendas activas conocidas para este título.
            </p>
          )}
        </div>
      </div>

      {officialLinks.length > 0 && (
        <div>
          <h2 className="stat-mono text-phosphor mb-3">Enlaces oficiales</h2>
          <div className="flex flex-col gap-2">
            {officialLinks.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-300 hover:text-phosphor inline-flex items-center gap-1.5"
              >
                {l.label} <ExternalLink size={12} />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
