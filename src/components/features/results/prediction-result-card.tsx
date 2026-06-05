import { TileBand } from "@/components/layout/tile-band";
import { cn } from "@/lib/utils";
import type { Match, Prediction, Score } from "@/types/domain";

type Outcome = "exact" | "correct" | "wrong" | "pending";

function getOutcome(prediction: Prediction): Outcome {
  if (prediction.pointsAwarded === null) return "pending";
  if (prediction.pointsAwarded === 3) return "exact";
  if (prediction.pointsAwarded === 1) return "correct";
  return "wrong";
}

function stageLabel(stage: string): string {
  switch (stage) {
    case "group":        return "Fase de Grupos";
    case "round-of-32": return "Dieciseisavos";
    case "round-of-16": return "Octavos";
    case "quarter-final": return "Cuartos de Final";
    case "semi-final":  return "Semifinal";
    case "third-place": return "Tercer Puesto";
    case "final":       return "Final";
    default:            return stage;
  }
}

interface PredictionResultCardProps {
  prediction: Prediction & { match: Match };
}

export function PredictionResultCard({ prediction }: PredictionResultCardProps) {
  const { match, predictedScore, pointsAwarded } = prediction;
  const outcome = getOutcome(prediction);
  const homeTeam = match.homeTeam;
  const awayTeam = match.awayTeam;

  return (
    <article
      className={cn(
        "border border-rule bg-paper",
        outcome === "exact"   && "border-l-4 border-l-pitch bg-pitch/5",
        outcome === "correct" && "border-l-4 border-l-pitch",
        outcome === "wrong"   && "border-l-4 border-l-card-red bg-card-red/5",
        outcome === "pending" && "border-l-4 border-l-rule",
      )}
    >
      <TileBand className="h-1.5" />

      {/* Header */}
      <header className="flex items-center justify-between border-b border-rule bg-floodlight px-3 py-1.5">
        <span className="font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
          {stageLabel(match.stage)}
          {match.group && ` · Grupo ${match.group}`}
        </span>
        <OutcomeBadge outcome={outcome} pointsAwarded={pointsAwarded} />
      </header>

      {/* Score body */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-4">
        {/* Home team */}
        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            {homeTeam?.flagUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={homeTeam.flagUrl}
                alt=""
                width={24}
                height={24}
                className="size-6 shrink-0 rounded-full border border-rule bg-floodlight"
              />
            )}
            <span className="font-display text-sm font-bold uppercase tracking-[0.10em] text-ink">
              {homeTeam?.code ?? "—"}
            </span>
          </div>
          <span className="truncate text-[11px] text-ink-muted">{homeTeam?.name ?? "Por definir"}</span>
        </div>

        {/* Scores */}
        <div className="flex flex-col items-center gap-2">
          <ScoreRow label="Pronóstico" score={predictedScore} />
          {match.score && <ScoreRow label="Real" score={match.score} highlight />}
        </div>

        {/* Away team */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <span className="font-display text-sm font-bold uppercase tracking-[0.10em] text-ink">
              {awayTeam?.code ?? "—"}
            </span>
            {awayTeam?.flagUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={awayTeam.flagUrl}
                alt=""
                width={24}
                height={24}
                className="size-6 shrink-0 rounded-full border border-rule bg-floodlight"
              />
            )}
          </div>
          <span className="truncate text-[11px] text-ink-muted">{awayTeam?.name ?? "Por definir"}</span>
        </div>
      </div>
    </article>
  );
}

function ScoreRow({ label, score, highlight = false }: { label: string; score: Score; highlight?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "w-16 text-right font-display text-[10px] font-medium uppercase tracking-[0.14em]",
          highlight ? "text-ink" : "text-ink-faint",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "nums font-display font-bold tabular-nums",
          highlight ? "text-base text-ink" : "text-sm text-ink-muted",
        )}
      >
        {score.home} – {score.away}
      </span>
    </div>
  );
}

function OutcomeBadge({
  outcome,
  pointsAwarded,
}: {
  outcome: Outcome;
  pointsAwarded: number | null;
}) {
  const { text, cls } = {
    exact:   { text: `Marcador exacto · +${pointsAwarded} pts`, cls: "text-pitch" },
    correct: { text: `Resultado correcto · +${pointsAwarded} pt`, cls: "text-pitch" },
    wrong:   { text: "Resultado incorrecto · +0 pts", cls: "text-card-red" },
    pending: { text: "Pendiente", cls: "text-ink-faint" },
  }[outcome];

  return (
    <span className={cn("font-display text-[10px] font-semibold uppercase tracking-[0.16em]", cls)}>
      {text}
    </span>
  );
}
