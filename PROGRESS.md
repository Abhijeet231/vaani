# Progress Log

## 2026-08-20 — Phase 2 kickoff: streaming pipeline dependency added

- Added `ws` + `@types/ws` to `apps/api` (Step 0 of the Phase 2 build plan).
- Step 1 done: `apps/api/src/config/sarvam.ts` now holds the single exported `sarvamClient` instance (mirrors the `env.ts` pattern). `prove-sarvam.ts` updated to import it instead of constructing its own client — re-ran against the real API, same Hindi transcript → Kannada translation as before.
- Confirmed `code-mixed` translate mode still leaves English words untranslated in real output (e.g. "sunshine", "clothes", "personal project") — still need to compare against `formal` mode before Step 2.

**Pending / not yet built (Phase 2):**
- `services/translate.service.ts` — Mayura translate wrapper (next up).
- `server.ts` restructure — explicit `http.Server` + attached `ws.Server`.
- `ws/oneToOne.gateway.ts` — the actual relay (browser WS ↔ Sarvam realtime STT ↔ translate).
- `scripts/prove-realtime.ts` — end-to-end proof script with a 16kHz mono PCM WAV fixture.
- Two open decisions: direction handshake shape (query params vs. first message) and Mayura translate mode (`code-mixed` vs `formal`).

## 2026-08-15 — Phase 1 complete: Sarvam STT + Mayura translate validated

- Fixed `apps/api/src/config/env.ts`'s unsafe `as string` cast on `sarvamApi` — replaced with a `getRequiredEnv()` helper that throws at startup if `SARVAM_API_KEY` is missing, instead of silently type-lying and failing later inside a Sarvam call.
- Found and removed a real Sarvam API key that had been checked into the working copy of `apps/api/.env.example` (never reached git history); replaced with a placeholder. The real key lives only in the gitignored `apps/api/.env`.
- Added `apps/api/src/scripts/prove-sarvam.ts` — a standalone script (not wired to any route) that sends a Hindi audio clip to Sarvam's REST speech-to-text endpoint, then feeds the resulting transcript into Mayura's translate endpoint (`hi-IN` → `kn-IN`). Verified against the real API: correct Hindi transcript, correct Kannada translation, end to end.
- Installed ffmpeg (via winget) to trim the test clip under the REST endpoint's 30-second limit (original clip was 33.7s; anything longer needs the Batch API, which is why multi-speaker mode uses Batch instead).
- Added the `sarvamai` SDK dependency; gitignored `**/test-assets/` so local audio fixtures never get committed.
- **Open item carried into Phase 2:** translate `mode` is currently `code-mixed`, which leaves some English words untranslated in the Kannada output (e.g. "sunshine", "personal project"). Compare against `formal` mode on the same transcript before locking in which one the real pipeline uses.

**Where Phase 2 picks up (scoped in conversation, not yet built):**
- 1-1 mode needs continuous low-latency streaming, not batch upload: mic captures small (~100–250ms) audio chunks pushed continuously over a WebSocket to our own `apps/api` relay, which forwards them to Sarvam's Realtime STT websocket. On each `final` STT segment, call Mayura translate (same logic already proven in Phase 1) and push the translated result back over the same socket. A REST-only approach can't do this — it needs a persistent connection.
- Multi-speaker mode (Phase 4, later) is architecturally different and NOT part of Phase 2: Sarvam's speaker diarization only works on the Batch API, not the streaming one, so that mode will buffer ~5–10s rolling audio chunks and submit each as a complete file instead of streaming continuously.
- Bulbul TTS (planned, 1-1 mode only — see below) is a Phase 3 follow-up, also not part of Phase 2.

Full phase-by-phase plan lives in the published roadmap artifact (link shared with the user in-session, not stored here since artifact URLs are per-session).

## 2026-08-15 — Planned addition: Bulbul TTS for 1-1 mode

Decided (not yet implemented) to add spoken output to 1-1 conversation mode: alongside the live translated transcript, speak the translation aloud using Sarvam's Bulbul TTS model. Deliberately scoped to 1-1 mode only — multi-speaker mode stays transcript-only, since speaking a diarized multi-person translation aloud is a separate problem not being tackled now. Documented in root `README.md` and `CLAUDE.md`. Will be built after the core 1-1 text pipeline (Phases 2-3) works.

## 2026-08-15 — Product direction defined; DB/auth deferred

Defined what vaani actually does (documented in root `README.md` and `CLAUDE.md`): a live speech-translation app used from one signed-in owner's device. The other person(s) never install the app or have an account.

- **1-1 conversation mode** — owner picks a language direction (e.g. Hindi → Kannada), records, gets a live translated transcript; flips the direction on the same device/session to let the other person reply. One session, manual per-turn direction toggle — not two participant accounts.
- **Multi-speaker mode** — owner records in a room with multiple people; app auto-detects number of speakers (diarization) and produces a live translated transcript labeled by speaker. Speaker labels are ephemeral to the session, not persisted identities.

Decided (but not yet implemented) future stack: Postgres + Drizzle ORM, hosted on NeonDB, for the database; Firebase Auth for authentication. Explicit decision: **do not build these yet.** Priority is a working, polished end-to-end model for both modes with no persistence at all. DB/auth get added when the app goes public, targeted ~1 month out from today.

## 2026-08-15 — Dev-time proxy from web to api

Added `apps/web/proxy.conf.json` (`/api` → `http://localhost:3000`) and wired it into `angular.json`'s `serve.options.proxyConfig`. Verified with both dev servers running: `http://localhost:4200/api/health` now returns `{"status":"ok"}` via the proxy, same as hitting `http://localhost:3000/api/health` directly. Frontend code can call `/api/...` with no absolute URL/CORS juggling in dev.

**Pending / not yet built:**
- Database and auth — stack decided (Postgres/Drizzle/NeonDB, Firebase Auth) but intentionally not started; see the product-direction entry above.
- The actual 1-1 and multi-speaker translation features (recording, speech-to-text, translation, live transcript, diarization) — nothing built yet, this is the current priority.
- CI, deployment/hosting setup for either app.
- Testing setup beyond the Angular CLI defaults (Vitest is present from `ng new`; no API tests yet).
- Shared code/types package between web and api (not needed yet — add only when duplication shows up).

## 2026-08-13 — Initial monorepo scaffold

Set up the pnpm workspace monorepo from scratch.

**Scaffolded:**
- `pnpm-workspace.yaml` pointing at `apps/*`, root `package.json` with `dev:web` / `dev:api` / `build:web` / `build:api` scripts.
- `apps/web` — Angular 22 app (`ng new`, routing enabled, standalone components, SCSS).
  - Angular Material added (`ng add @angular/material`), M3 theme, azure-blue palette (prebuilt, not the default purple/pink).
  - Tailwind CSS v4 added alongside Material via `@tailwindcss/postcss`, with `styles.scss` (Material theme, wrapped in `@layer mat-theme`) and `tailwind.css` (Tailwind entry) kept as separate files. Verified in the compiled CSS that Tailwind's layers register after `mat-theme` and that utility classes apply to Material components; documented the one cascade gotcha (Material's own component CSS ships unlayered, so a conflicting utility needs Tailwind's `!` important modifier) in `apps/web/CLAUDE.md`.
  - State management: plain Angular signals, no store library (per user decision).
- `apps/api` — Express + TypeScript backend.
  - `src/routes`, `src/controllers`, `src/models`, `src/config` structure.
  - `GET /api/health` → `{ status: "ok" }`, verified responding.
  - nodemon + ts-node for dev, `tsc` build to `dist/`, dotenv with `.env.example`.
- Root `.gitignore`, root/web/api `CLAUDE.md` files.
- `pnpm install` run at the workspace root; both `pnpm dev:web` (http://localhost:4200) and `pnpm dev:api` (http://localhost:3000) verified running, health endpoint confirmed responding with `200 {"status":"ok"}`.

**Pending / not yet built:**
- Database (none chosen yet — no ORM, no models beyond the empty `src/models/` folder).
- Authentication.
- Dev-time proxy from `apps/web` to `apps/api` (currently two separate ports, no `proxy.conf.json`).
- CI, deployment/hosting setup for either app.
- Testing setup beyond the Angular CLI defaults (Vitest is present from `ng new`; no API tests yet).
- Shared code/types package between web and api (not needed yet — add only when duplication shows up).
