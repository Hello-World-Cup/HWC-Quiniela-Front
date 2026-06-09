import Image from "next/image";
import { prizeForPhase, type PrizePhase } from "@/data/prizes";
import { TileBand } from "@/components/layout/tile-band";
import { cn } from "@/lib/utils";

interface PrizeCalloutProps {
  phase: PrizePhase;
  className?: string;
}

/**
 * Inline sponsor placard shown on each prediction page. Three columns:
 * yellow rank stamp · prize copy · partner logo. Mirrors the Panini
 * sticker-album block aesthetic used throughout the site.
 */
export function PrizeCallout({ phase, className }: PrizeCalloutProps) {
  const prize = prizeForPhase(phase);
  if (!prize) return null;

  return (
    <aside
      className={cn("border border-ink bg-paper", className)}
      aria-label={`Premio de la fase ${prize.phaseLabel}`}
    >
      <TileBand className="h-1.5" />
      <div className="flex items-stretch">
        {/* Rank stamp — official gold */}
        <div className="flex min-w-[64px] flex-col items-center justify-center border-r border-ink bg-card-yellow px-3 py-2 sm:min-w-[80px]">
          <span className="font-display text-[9px] font-bold uppercase tracking-[0.18em] text-ink/70">
            Premio
          </span>
          <span className="mt-0.5 font-display text-2xl font-bold leading-none text-ink sm:text-3xl">
            N°{prize.rank}
          </span>
        </div>

        {/* Phase label + description */}
        <div className="flex flex-1 flex-col justify-center px-4 py-3">
          <p className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-card-red">
            {prize.phaseLabel}
          </p>
          <p className="mt-1 text-sm font-medium leading-snug text-ink sm:text-[15px]">
            {prize.description}
          </p>
        </div>

        {/* Sponsor logo */}
        <div className="flex min-w-[88px] items-center justify-center border-l border-ink bg-floodlight px-3 py-2 sm:min-w-[112px]">
          <Image
            src={prize.sponsor.logoSrc}
            alt={`Logo de ${prize.sponsor.name}`}
            width={160}
            height={64}
            className="h-9 w-auto object-contain sm:h-12"
          />
        </div>
      </div>
    </aside>
  );
}
