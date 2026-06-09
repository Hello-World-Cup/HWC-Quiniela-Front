@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack & versions (read carefully)

- **Next.js 16.2.6** with App Router, **React 19.2.4**, **Tailwind v4** (PostCSS-only, no `tailwind.config`), **NextAuth v5 beta 31**, **TypeScript strict**, **pnpm**.
- The Next.js APIs and conventions here differ from older versions you may know. Authoritative docs are bundled at `node_modules/next/dist/docs/` (`01-app/` is the App Router) — consult them before writing routing, caching, server actions, or middleware code.
- Notable: this project uses **`src/proxy.ts`** (a Next 16 concept) instead of the old `middleware.ts`. It re-exports `auth` from `@/auth` and skips static assets via its `matcher`. Do not "fix" this back to `middleware.ts`.

## Commands

```bash
pnpm dev        # next dev (localhost:3000)
pnpm build      # next build
pnpm start      # next start (after build)
pnpm lint       # eslint (flat config: eslint.config.mjs)
```

No test runner is configured. There is no typecheck script — run `pnpm exec tsc --noEmit` if you need one.

## Architecture

The product is a FIFA World Cup 2026 prediction app ("quiniela"). The user flow is a **three-stage funnel** enforced by route order:

1. `/predictions/groups` — order the 4 teams in each of 12 groups (A–L)
2. `/predictions/best-thirds` — pick which 8 of the 12 third-placed teams advance
3. `/predictions/knockout` — fill scores for the 32→16→8→4→3rd/Final bracket

Stages 2 and 3 are **gated** on the previous stage being complete (see `isGroupOrderComplete` / `isBestThirdsComplete` in `src/lib/knockout.ts`). The knockout page renders an `EmptyState` (deferral panel) until prereqs are met.

### Routing layout

- `src/app/layout.tsx` — root layout, fonts (Geist, Geist_Mono, Oswald), `<Toaster>`.
- `src/app/(app)/` — route group for all authenticated app pages. Its `layout.tsx` mounts `<StoreHydrator>` + `<SiteHeader>`.
- `src/app/sign-in/page.tsx` — public sign-in page.
- `src/app/api/auth/[...nextauth]/route.ts` — NextAuth handlers.
- `src/proxy.ts` — Next 16 proxy (middleware replacement) that re-exports `auth` for route protection. The matcher excludes `_next/static`, `_next/image`, `assets/`, and image extensions — **the image optimizer re-fetches through this handler, so do not extend the matcher to cover those paths** (would break image optimization, per the inline comment).

### Auth flow (non-obvious)

`src/auth.ts` (NextAuth v5):

1. User signs in with Google (OIDC).
2. In the `jwt` callback, the Google `id_token` is POSTed to `${API_BASE_URL}/auth/google` to exchange it for a backend `access_token`.
3. That `access_token` is persisted on the JWT as `token.backendToken` and exposed to client/server code via `session.user.backendToken` (typed in `src/types/next-auth.d.ts`).
4. All backend API calls (server actions, `apiFetch`) authenticate using this `backendToken`, not the Google token.

The `authorized` callback allows `/`, `/sign-in*`, and `/api/auth*` without a session; everything else requires login.

### State management — split by ownership

- **Server (canonical)**: the backend API is the source of truth for submitted predictions, matches, teams, leaderboard. Server-side reads go through `src/lib/api/client.ts` (`apiFetch` — wraps `fetch` with `next: { tags, revalidate }` cache hints, Bearer token, and `ApiError`). Endpoints are declared in `src/lib/api/endpoints.ts` with `cacheTags` for `revalidatePath`/`revalidateTag` reuse. **Writes go through server actions** in `src/lib/actions/` (e.g. `submitKnockoutPredictions`) which call `revalidatePath` on success.
- **Client (in-progress picks)**: `src/lib/store/predictions.ts` — Zustand store persisted to localStorage under key `hwc-quiniela:predictions`, holding `groupOrder` / `bestThirds` / `knockoutPicks`. **`skipHydration: true`** is set, so `<StoreHydrator>` (mounted in the `(app)` layout) calls `usePredictionsStore.persist.rehydrate()` after mount to avoid SSR hydration mismatches. The store represents *unsubmitted* picks; the user explicitly submits via `SaveQuinielaButton` → `submitKnockoutPredictions` server action.

`src/lib/knockout.ts` is the bridge: `resolveAllMatches({ groupOrder, bestThirds, knockoutPicks })` walks the bracket in canonical order resolving each slot (group winner, runner-up, best third, prior-match winner/loser) into either a concrete team or a placeholder. Downstream UI (`MatchCard`, etc.) consumes this resolved view.

### Bracket data (`src/data/bracket.ts`) — the tricky bit

- 32 knockout matches (FIFA numbers 73–104) are hardcoded with their official slot definitions.
- 8 of the R32 matches feature a "best third-placed team" (`GroupThird`) whose source group is one of a documented candidate list (5 per slot).
- FIFA's Annex C enumerates all 495 valid `(8-of-12 groups) → 8 slots` assignments but does not provide an algorithm. **This project uses a deterministic greedy assignment as a fallback**, with a strict-constraint pass and a relaxed fallback for rare edge cases. Treat `assignBestThirdsToSlots` as MVP behavior; it is *not* a faithful Annex C reproduction. Don't rip it out without understanding the constraint semantics in the file header comment.
- Server actions translate the user's local bracket match ids to backend match ids by fetching `/matches?stage=...` for every knockout stage and indexing by `fifaNumber` (see `fetchMatchIdMap` in `src/lib/actions/predictions.ts`).

### UI conventions

- shadcn/ui (`components.json`: style `base-nova`, base color `neutral`, RSC enabled). Components live in `src/components/ui/`; feature-specific UI in `src/components/features/<feature>/`; layout chrome in `src/components/layout/`.
- Icons: `lucide-react`.
- Drag-and-drop (used in group ordering): `@dnd-kit/*`.
- Tailwind v4: design tokens are defined in `src/app/globals.css` (custom palette: `ink`, `paper`, `chalk`, `card-red`, etc., and the `font-display` Oswald family). There is no `tailwind.config.*` file — extend tokens by editing `globals.css`.
- All user-facing copy is **Spanish** (the audience is Spanish-speaking). Match this when adding new strings.

### Environment

`.env.local` is required for dev. See `.env.example`:

- `NEXT_PUBLIC_API_BASE_URL` — backend root, e.g. `https://api.example.com/v1`. `src/lib/env.ts` throws at module load if missing (client-side path). Server actions read `process.env.API_BASE_URL ?? NEXT_PUBLIC_API_BASE_URL` lazily at call time — this is intentional so that env changes during dev don't require a server restart and so module load doesn't fail before auth is reachable. Preserve that pattern in new server actions.
- `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` — NextAuth/Google OAuth. Authorized redirect URI for local dev: `http://localhost:3000/api/auth/callback/google`.

### Things to know before editing

- **Adding a new authenticated page**: put it under `src/app/(app)/...`. The route group inherits the auth-protected layout. The proxy already gates it.
- **Adding a backend write**: prefer a server action in `src/lib/actions/` (auth via `auth()` from `@/auth`, `revalidatePath` on success). Don't call the backend directly from client components with the user's `backendToken` — keep that token server-side.
- **Adding a backend read**: add an entry to `src/lib/api/endpoints.ts` reusing or extending `cacheTags`. Call from a server component (or a server action) so the cache tags actually work.
- **Editing the prediction store**: it's persisted; bumping the shape without a migration will leave existing users with stale localStorage. The `name` is `hwc-quiniela:predictions`.
