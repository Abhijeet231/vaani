# Progress Log

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
