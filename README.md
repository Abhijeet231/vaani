# vaani

pnpm workspace monorepo — Angular frontend + Node/Express API.

## What vaani is

A live speech-translation app, used from a single signed-in owner's phone — the other person(s) never need the app or an account. Two modes:

- **1-1 conversation mode** — the owner picks a language direction (e.g. Hindi → Kannada), taps record, and speaks; a live translated transcript appears in Kannada for the other person to read. When the other person wants to reply, the owner flips the direction (Kannada → Hindi) and they speak into the same phone; the translated transcript now appears in Hindi. One session, one device, direction toggled per turn.
- **Multi-speaker mode** — same single-device/session idea, but instead of manually flipping direction, the app auto-detects how many people are talking in the room (diarization) and produces a live translated transcript labeled by speaker (Speaker 1, Speaker 2, ...), without those speakers ever signing up or being identified as users.

No accounts, invites, or data are attached to the other participants in either mode — everything is scoped to the owner's session.

## Structure

```
apps/
├── web/     Angular 22 + Angular Material + Tailwind CSS v4
└── api/     Node.js + Express + TypeScript
```

See [CLAUDE.md](CLAUDE.md) for the full breakdown, and [apps/web/CLAUDE.md](apps/web/CLAUDE.md) / [apps/api/CLAUDE.md](apps/api/CLAUDE.md) for per-app conventions.

## Getting started

```bash
pnpm install
```

Run the frontend and backend in separate terminals:

```bash
pnpm dev:web   # http://localhost:4200
pnpm dev:api   # http://localhost:3000
```

Check the API is up:

```bash
curl http://localhost:3000/api/health
# {"status":"ok"}
```

## Building

```bash
pnpm build:web   # apps/web/dist
pnpm build:api   # apps/api/dist
```

## Status

See [PROGRESS.md](PROGRESS.md) for a dated log of what's been built and what's still pending.
