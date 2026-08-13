# your-mvp

pnpm workspace monorepo for the MVP. Two apps, one workspace root.

## Structure

```
your-mvp/
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
