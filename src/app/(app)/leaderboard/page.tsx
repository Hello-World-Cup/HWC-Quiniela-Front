import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { leaderboardApi } from "@/lib/api/endpoints";
import type { LeaderboardEntry } from "@/types/domain";

async function loadLeaderboard(): Promise<{ entries: LeaderboardEntry[]; error: string | null }> {
  try {
    const entries = await leaderboardApi.global();
    return { entries, error: null };
  } catch (error) {
    return {
      entries: [],
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export default async function LeaderboardPage() {
  const { entries, error } = await loadLeaderboard();

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Tabla de Posiciones</h1>
        <p className="text-sm text-muted-foreground">Ranking global por puntos totales.</p>
      </header>

      {error && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">API no disponible</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{error}</CardContent>
        </Card>
      )}

      {!error && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Jugador</TableHead>
              <TableHead className="text-right">Exactos</TableHead>
              <TableHead className="text-right">Resultado</TableHead>
              <TableHead className="text-right">Puntos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Aún no hay clasificaciones.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.userId}>
                  <TableCell className="font-mono">{entry.rank}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7">
                        {entry.avatarUrl && <AvatarImage src={entry.avatarUrl} alt="" />}
                        <AvatarFallback>{entry.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{entry.displayName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{entry.exactScores}</TableCell>
                  <TableCell className="text-right tabular-nums">{entry.correctResults}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {entry.totalPoints}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </section>
  );
}
