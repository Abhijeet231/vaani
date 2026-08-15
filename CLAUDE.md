# vaani

pnpm workspace monorepo for vaani. Two apps, one workspace root.

## Product

vaani is a live speech-translation app driven from a single signed-in owner's device. The other person(s) in the conversation never install the app or have an account — translation happens entirely on the owner's phone for them to read (and speak into).

Two modes, both scoped to one owner session with no accounts/data for the other party:

- **1-1 conversation mode** — owner sets a language direction (e.g. Hindi → Kannada), records, and gets a live translated transcript in the target language. To let the other person reply, the owner flips the direction (Kannada → Hindi) on the same device/session — it's a manual per-turn toggle, not two separate participant accounts.
- **Multi-speaker mode** — owner records in a room with multiple people talking; the app auto-detects the number of distinct speakers (diarization) and produces a live translated transcript labeled by speaker (Speaker 1, Speaker 2, ...). Speaker labels are ephemeral to that session, not persisted identities.

**Planned addition, 1-1 mode only (not yet built):** speak the translated text aloud using Sarvam's Bulbul TTS model, alongside the live transcript, so the other person can listen instead of only reading. Deliberately scoped to 1-1 mode — multi-speaker mode stays transcript-only for now, since speaking a diarized multi-person translation aloud is a separate, harder problem not being tackled yet.

Current focus: get a working end-to-end model for both modes (no persistence) before adding accounts or a database. Auth and DB are deliberately deferred — see below.

## Structure

```
Vaani/
├── apps/
│   ├── web/     Angular 22 frontend
│   └── api/     Node.js/Express backend
├── pnpm-workspace.yaml
├── package.json     root scripts (pnpm --filter wrappers)
├── PROGRESS.md       dated log of what's been built
└── README.md
```

Each app has its own `CLAUDE.md` with app-specific conventions:
[apps/web/CLAUDE.md](apps/web/CLAUDE.md), [apps/api/CLAUDE.md](apps/api/CLAUDE.md).

## Tech stack

- **apps/web** — Angular 22 (standalone components, no NgModules), Angular Material (M3, azure-blue prebuilt theme), Tailwind CSS v4, SCSS, signals for state.
- **apps/api** — Node.js, Express, TypeScript, nodemon + ts-node for dev, dotenv for config.
- **Tooling** — pnpm workspaces (`apps/*`). No shared/packages directory yet — add one only when web and api actually need to share code (e.g. types).
- **Speech/translation** — Sarvam AI: Saaras STT for transcription (validated in Phase 1), Mayura for text translation (validated in Phase 1). Bulbul TTS planned for spoken output in 1-1 mode — not yet implemented.
- **Database (planned, not yet implemented)** — Postgres via Drizzle ORM, hosted on NeonDB.
- **Auth (planned, not yet implemented)** — Firebase Auth.
- Both are intentionally deferred: the priority is a working, polished 1-1 / multi-speaker model first; accounts and persistence get added when the app goes public (targeted ~1 month out from 2026-08-15).

## Commands (run from repo root)

| Command | Effect |
|---|---|
| `pnpm install` | Install deps for both apps |
| `pnpm dev:web` | Angular dev server (`http://localhost:4200`) |
| `pnpm dev:api` | Express in watch mode (`http://localhost:3000`) |
| `pnpm build:web` | Production Angular build |
| `pnpm build:api` | Compile API to `apps/api/dist` |

Both dev servers need to run simultaneously (two terminals, or `pnpm dev:web` / `pnpm dev:api` in parallel) for the frontend to talk to the backend.

## Status

See [PROGRESS.md](PROGRESS.md) for what's built and what's still pending (database, auth, deployment, proxying web→api in dev).
