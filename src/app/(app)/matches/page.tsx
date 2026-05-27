import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { matchesApi } from "@/lib/api/endpoints";
import type { Match } from "@/types/domain";

async function loadMatches(): Promise<{ matches: Match[]; error: string | null }> {
  try {
    const matches = await matchesApi.list();
    return { matches, error: null };
  } catch (error) {
    return {
      matches: [],
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export default async function MatchesPage() {
  const { matches, error } = await loadMatches();

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Partidos</h1>
          <p className="text-sm text-muted-foreground">Fase de grupos y eliminatorias.</p>
        </div>
      </header>

      {error && (
        <Card className="mb-6 border-dashed">
          <CardHeader>
            <CardTitle className="text-base">API no disponible</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Define <code className="font-mono">NEXT_PUBLIC_API_BASE_URL</code> en
            {" "}<code className="font-mono">.env.local</code> y recarga. Detalles: {error}
          </CardContent>
        </Card>
      )}

      {!error && matches.length === 0 && (
        <p className="text-muted-foreground">Aún no hay partidos programados.</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  );
}

function MatchCard({ match }: { match: Match }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Badge variant="outline" className="capitalize">
          {match.stage.replace("-", " ")}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {new Date(match.kickoff).toLocaleString()}
        </span>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <TeamRow name={match.homeTeam.name} code={match.homeTeam.code} />
        <div className="px-3 text-xl font-bold tabular-nums">
          {match.score ? `${match.score.home} – ${match.score.away}` : "vs"}
        </div>
        <TeamRow name={match.awayTeam.name} code={match.awayTeam.code} reverse />
      </CardContent>
    </Card>
  );
}

function TeamRow({ name, code, reverse = false }: { name: string; code: string; reverse?: boolean }) {
  return (
    <div className={`flex flex-1 items-center gap-2 ${reverse ? "flex-row-reverse text-right" : ""}`}>
      <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono uppercase">{code}</span>
      <span className="truncate text-sm font-medium">{name}</span>
    </div>
  );
}
