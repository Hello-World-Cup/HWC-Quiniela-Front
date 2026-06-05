import { auth } from "@/auth";
import { PredictionResultCard } from "@/components/features/results/prediction-result-card";
import { predictionsApi } from "@/lib/api/endpoints";
import type { Match, Prediction } from "@/types/domain";

type PredictionWithMatch = Prediction & { match: Match };

export default async function ResultsPage() {
  const session = await auth();
  const token = session?.user?.backendToken;

  const predictions = token
    ? await predictionsApi.me(token).catch(() => [] as Prediction[])
    : ([] as Prediction[]);

  const withMatch = predictions.filter(
    (p): p is PredictionWithMatch => !!p.match,
  );

  const finished = withMatch.filter((p) => p.match.status === "finished");
  const pending  = withMatch.filter((p) => p.match.status !== "finished");

  const totalPts    = finished.reduce((acc, p) => acc + (p.pointsAwarded ?? 0), 0);
  const exactScores = finished.filter((p) => p.pointsAwarded === 3).length;
  const correct     = finished.filter((p) => p.pointsAwarded === 1).length;
  const wrong       = finished.filter((p) => p.pointsAwarded === 0).length;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* Page header */}
      <header className="mb-6 border-b border-rule pb-6">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-pitch">
          Mis Resultados
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight text-ink sm:text-4xl">
          Mis Pronósticos
        </h1>
        <p className="mt-2 max-w-prose text-sm text-ink-muted">
          Revisa cuántos puntos llevas acumulados. Las cards en verde son aciertos, en rojo son errores.
        </p>
      </header>

      {/* Stats bar — only if there are finished predictions */}
      {finished.length > 0 && (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Puntos totales" value={totalPts} accent="pitch" />
          <StatCard label="Exactos" value={exactScores} accent="pitch" />
          <StatCard label="Correctos" value={correct} accent="pitch" />
          <StatCard label="Incorrectos" value={wrong} accent="card-red" />
        </div>
      )}

      {/* Empty state */}
      {withMatch.length === 0 && (
        <div className="border border-rule bg-floodlight px-6 py-12 text-center">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-ink-faint">
            Sin pronósticos enviados
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            Completa los tres pasos de predicción para ver tus resultados aquí.
          </p>
        </div>
      )}

      {/* Finished matches */}
      {finished.length > 0 && (
        <div className="mb-10">
          <SectionHeader title="Partidos jugados" count={finished.length} />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {finished.map((p) => (
              <PredictionResultCard key={p.id} prediction={p} />
            ))}
          </div>
        </div>
      )}

      {/* Pending matches */}
      {pending.length > 0 && (
        <div>
          <SectionHeader title="Próximos partidos" count={pending.length} />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {pending.map((p) => (
              <PredictionResultCard key={p.id} prediction={p} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "pitch" | "card-red";
}) {
  return (
    <div className="border border-rule bg-paper px-4 py-3">
      <p className="font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-faint">
        {label}
      </p>
      <p
        className={`mt-1 font-display text-2xl font-bold tabular-nums ${
          accent === "pitch" ? "text-pitch" : "text-card-red"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="mb-4 flex items-baseline justify-between border-b border-rule pb-3">
      <h2 className="font-display text-lg font-bold uppercase tracking-tight text-ink">
        {title}
      </h2>
      <span className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-ink-faint">
        {count} {count === 1 ? "partido" : "partidos"}
      </span>
    </div>
  );
}
