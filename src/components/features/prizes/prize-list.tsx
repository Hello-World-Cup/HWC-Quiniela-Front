import Image from "next/image";
import { prizes } from "@/data/prizes";
import { TileBand } from "@/components/layout/tile-band";

/**
 * Full ladder of prizes, top to bottom (Final → group stage). Rendered on
 * the sign-in page so prospective users see what they're playing for.
 * Each row: gold rank stamp · phase + description · partner logo.
 */
export function PrizeList() {
  return (
    <section
      className="w-full border border-ink bg-paper"
      aria-label="Premios por fase del torneo"
    >
      <TileBand className="h-2" />
      <header className="flex items-center justify-between border-b border-ink px-4 py-2.5">
        <span className="font-display text-xs font-bold uppercase tracking-[0.18em] text-ink">
          Premios por fase
        </span>
        <span className="font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
          Mundial · 2026
        </span>
      </header>
      <ol className="divide-y divide-rule">
        {prizes.map((p) => (
          <li key={p.phase} className="flex items-stretch">
            {/* Rank stamp */}
            <div className="flex min-w-[56px] flex-col items-center justify-center border-r border-rule bg-card-yellow px-2 py-2">
              <span className="font-display text-[8px] font-bold uppercase tracking-[0.18em] text-ink/70">
                N°
              </span>
              <span className="font-display text-xl font-bold leading-none text-ink">
                {p.rank}
              </span>
            </div>

            {/* Phase + description */}
            <div className="flex flex-1 flex-col justify-center px-3 py-2.5 sm:px-4">
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-card-red">
                {p.phaseLabel}
              </p>
              <p className="mt-0.5 text-sm leading-snug text-ink">
                {p.description}
              </p>
            </div>

            {/* Sponsor logo */}
            <div className="flex min-w-[80px] items-center justify-center border-l border-rule bg-floodlight px-2 py-2">
              <Image
                src={p.sponsor.logoSrc}
                alt={`Logo de ${p.sponsor.name}`}
                width={140}
                height={56}
                className="h-8 w-auto object-contain"
              />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
