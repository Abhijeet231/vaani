# vaani

pnpm workspace monorepo for vaani. Two apps, one workspace root.

## Product

vaani is a live speech-translation app driven from a single signed-in owner's device. The other person(s) in the conversation never install the app or have an account — translation happens entirely on the owner's phone for them to read (and speak into).

Two modes, both scoped to one owner session with no accounts/data for the other party:

- **1-1 conversation mode** — owner sets a language direction (e.g. Hindi → Kannada), records, and gets a live translated transcript in the target language. To let the other person reply, the owner flips the direction (Kannada → Hindi) on the same device/session — it's a manual per-turn toggle, not two separate participant accounts.
- **Multi-speaker mode — PARKED (2026-09-03), not built.** The original plan was: owner records in a room with several people, the app diarizes and produces a transcript labeled by speaker. Deferred indefinitely; revisit only if there's real demand after launch. 1-1 is the product that ships.

**Spoken output is built.** The translated text is spoken aloud with Sarvam's Bulbul TTS via `POST /api/one-to-one/speak`, with a per-turn play button in `/app`. Bulbul covers 11 of the 14 languages, so the button is gated on `TTS_SUPPORTED_LANGUAGE_CODES` — don't assume every entry in `LANGUAGES` can be spoken.

Current focus: launch 1-1. Auth, database, payments and history are all shipped (see Tech stack); what's left is business/legal setup rather than features — see the pending list at the top of [PROGRESS.md](PROGRESS.md).

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

- **apps/web** — Angular 22 (standalone components, no NgModules), Angular Material (M3, one dark "Graphite & Jade" theme defined in `styles.scss`), Tailwind CSS v4, SCSS, signals for state.
- **apps/api** — Node.js, Express, TypeScript, nodemon + ts-node for dev, dotenv for config.
- **Tooling** — pnpm workspaces (`apps/*`). No shared/packages directory yet — add one only when web and api actually need to share code (e.g. types).
- **Speech/translation** — Sarvam AI: Saaras STT for transcription, Mayura for text translation, Bulbul TTS for spoken output. All three are wired and in use.
- **Database** — Postgres via Drizzle ORM on NeonDB. Shipped: `users`, `purchases`, `conversations`, `waitlist_signups`.
- **Auth** — Firebase Auth, **Google sign-in only** (email/password was removed 2026-09-08 — see `login.ts` for why). `requireAuth` additionally rejects tokens without `email_verified`.
- **Payments** — Razorpay recharge packs credited onto a `turnsBalance`; new accounts get `FREE_TRIAL_TURNS`. Still on test keys — live keys need KYC.
- **Rate limiting** — `express-rate-limit`, three layers (global per-IP, a tight one on the public waitlist POST, and a per-user one on the Sarvam-spending routes). The API sets `trust proxy` for Render; don't remove it or every caller looks like the proxy.

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
