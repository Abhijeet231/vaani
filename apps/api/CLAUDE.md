# apps/api — Node/Express backend

Node.js + Express + TypeScript. Compiled with `tsc`, run in dev via `nodemon` + `ts-node`.

## Structure

```
src/
├── config/      env loading, future db/service config
├── controllers/ request handlers (business logic, talk to models)
├── models/      data models (empty until a database is added)
├── routes/      Express routers, one file per resource, wired together in routes/index.ts
├── app.ts       Express app: middleware, route mounting, error handling
└── server.ts    entrypoint — imports app, starts listening
```

## Routing / controller pattern

- One router file per resource under `src/routes/` (e.g. `health.routes.ts`), exporting an `express.Router()`.
- All resource routers are mounted onto a single `apiRouter` in `src/routes/index.ts`, which `app.ts` mounts at `/api`. New resources: add a router file, mount it in `routes/index.ts` — don't mount routers directly in `app.ts`.
- Routers stay thin — they map `method + path` to a controller function, no logic in the route file itself.
- Controllers (`src/controllers/`) hold the actual request handling. One function per endpoint, `(req: Request, res: Response) => void`. Once there's a database, controllers call into `src/models/` rather than querying directly.

## Error handling

- `app.ts` registers a catch-all 404 handler and a final 4-arg error-handling middleware (Express identifies it by arity, must stay last).
- Controllers should throw or pass errors to `next(err)` for anything unexpected; let the central error handler format the response rather than try/catching and formatting per-route. Add domain-specific error handling only once there are error types worth distinguishing (validation vs. not-found vs. auth, etc.) — not needed yet at MVP scale.

## Environment variables

- `src/config/env.ts` calls `dotenv.config()` once and exports a typed `env` object — import `env` from there rather than reading `process.env` directly elsewhere, so there's one place that knows the defaults and one place to add validation later.
- `.env` is gitignored; `.env.example` documents every variable with a non-secret placeholder/default. Keep them in sync — when you add a variable to `.env`, add it to `.env.example` too.
