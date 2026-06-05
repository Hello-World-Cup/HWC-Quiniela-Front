export type GroupId =
  | "A" | "B" | "C" | "D" | "E" | "F"
  | "G" | "H" | "I" | "J" | "K" | "L";

export type MatchStage =
  | "group"
  | "round-of-32"
  | "round-of-16"
  | "quarter-final"
  | "semi-final"
  | "third-place"
  | "final";

export type MatchStatus = "scheduled" | "live" | "finished" | "postponed";

export interface Team {
  id: string;
  name: string;
  code: string;
  flagUrl: string;
  group: GroupId | null;
}

export interface Score {
  home: number;
  away: number;
}

export interface Match {
  id: string;
  stage: MatchStage;
  group: GroupId | null;
  kickoff: string;
  venue: string | null;
  status: MatchStatus;
  homeTeam: Team | null;
  awayTeam: Team | null;
  score: Score | null;
  matchLabel?: string | null;
  fifaNumber?: number | null;
  predictionDeadline?: string | null;
}

export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  predictedScore: Score;
  pointsAwarded: number | null;
  submittedAt: string;
  match?: Match;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  totalPoints: number;
  exactScores: number;
  correctResults: number;
}
