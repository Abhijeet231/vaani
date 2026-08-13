# your-mvp

pnpm workspace monorepo — Angular frontend + Node/Express API.

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
