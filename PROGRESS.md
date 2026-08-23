# Progress Log

## 2026-08-23 — Bulbul TTS: speaker button on translated turns, synthesize-once-cache-and-replay

- Backend: `apps/api/src/services/speech.service.ts` — `synthesizeSpeech({ text, languageCode })` wraps `sarvamClient.textToSpeech.convert` (`bulbul:v3`), decodes the base64 WAV response into a `Buffer`. New route `POST /api/one-to-one/speak?language=kn-IN` with `{ text }` JSON body, returns raw `audio/wav` bytes (`controllers/oneToOne.controller.ts`'s new `speakText`, mounted in `routes/oneToOne.routes.ts`). Verified against the real API via `curl` — valid WAV came back (RIFF/WAVE, 16-bit mono).
- Frontend: `Turn` gained `audioUrl`/`isSynthesizing`. Each translated turn gets a speaker icon (gated to `TTS_SUPPORTED_LANGUAGE_CODES` in `languages.ts`, since Bulbul supports fewer languages than STT/translate and Odia uses a different code there — `od-IN` vs. the `or-IN` used elsewhere in Sarvam's own APIs). First tap POSTs to `/one-to-one/speak`, caches the response as an object URL on that turn, and plays it; every tap after that just replays the cached `Audio` — no repeat API call, so repeat listens cost nothing extra (this was explicitly the point — Bulbul is billed per character synthesized).
- Verified end-to-end in a real browser: proxy path confirmed via direct `fetch()`, then exercised the actual button through the running Angular component (injected a fake turn via `ng.getComponent`, since real turns require a mic recording automation can't grant permission for) — clicking synthesized real audio, cached the blob URL, and a second click made zero additional network requests to `/speak` (confirmed via network log — one request total across two clicks). `ng build` clean.

**Pending / not yet built:**
- Manual full round trip still needed from the user: record real speech → get a translation → tap the speaker → confirm actual audio plays audibly (automation could drive the click and confirm the network/caching behavior, but couldn't itself judge whether the audio *sounds* right).
- No cleanup of object URLs (`URL.revokeObjectURL`) on unmount — fine at MVP scale (a handful of turns per session, page reload clears them), revisit if this ever becomes a long-running single session.
- Speaker/voice, pace, temperature all left at Bulbul v3 defaults — no UI to change them yet.

## 2026-08-23 — 1-1 mode frontend: record, translate, display

- New feature `apps/web/src/app/features/one-to-one/` (`OneToOne` component): language direction pickers (`mat-select` x2 + swap button, signals-based, from a hardcoded `LANGUAGES` list matching Sarvam's supported BCP-47 codes), a record button (`MediaRecorder` — tap to start, tap to stop, no VAD/auto-stop yet), and a running list of `{transcript, translatedText}` turns rendered newest-first. POSTs the recorded blob straight to `/api/one-to-one/translate` (the batch endpoint from the entry above) with the audio's own MIME type (Chrome records `audio/webm`, which Sarvam's batch STT accepts directly — no client-side transcoding needed).
- Wired up: `app.routes.ts` now routes `''` to `OneToOne`; `app.config.ts` gained `provideHttpClient()`; `app.html`/`app.ts` stripped down to just the toolbar + `router-outlet` (removed the scaffold's placeholder Material+Tailwind demo card), title changed from `'web'` to `'vaani'`.
- Verified: `ng build` clean (one pre-existing bundle-size budget warning, not from this work). Ran both dev servers and drove the real page in a browser — language selects and the direction-swap button work correctly (confirmed via screenshot: Hindi/Kannada swapped to Kannada/Hindi, dropdown opens with the current selection checked). **Could not verify the actual record → mic-permission → upload → translate round trip this way**: clicking the record button hangs on Chrome's native mic-permission prompt, which lives outside the page DOM and isn't clickable by the browser-automation tool. The backend half of that path is already proven separately (`prove-realtime.ts`'s sibling batch test via `curl` in the previous entry got a correct real transcript+translation back from this exact endpoint) — the unverified part is purely "does a real browser's `MediaRecorder` blob reach it correctly," which is standard Web API usage but genuinely untested end-to-end.
- Pre-existing, unrelated: `app.spec.ts`'s "should render title" test already asserted on an `<h1>` that hasn't existed since the Material+Tailwind demo replaced the CLI's default scaffold template, well before this session — left as-is, not something this change broke or was asked to fix.

**Pending / not yet built:**
- **User: please manually test the record button in a real browser** (grant mic permission when prompted) and confirm you get a transcript+translation back — this is the one path automation couldn't reach.
- No auto-stop (silence/VAD) — recording is manual tap-to-stop only; fine for MVP, revisit if it feels awkward in practice.
- No loading/error snackbar polish beyond inline text — acceptable for MVP.
- Multi-speaker mode UI — not started, out of scope for this phase.

## 2026-08-23 — Phase 2 pivot: batch (record-then-send) 1-1 endpoint, verified working end-to-end

- Decided to unblock 1-1 mode on the batch REST path instead of waiting on Sarvam realtime-WS access (still unresolved — see entry below). Same approach already planned for multi-speaker mode, so no throwaway work; the realtime relay (`ws/oneToOne.gateway.ts`, `openSaarasStream`) is untouched and stays ready to swap back in once that access comes through.
- Added `transcribeAudio({ audio, languageCode })` to `transcription.service.ts` — wraps the batch `sarvamClient.speechToText.transcribe` call (`saaras:v3`, `mode: "transcribe"`), same one already proven in `prove-sarvam.ts`. Accepts a `Buffer` directly (no temp file needed — the SDK's `Uploadable` type takes a `Buffer` as-is).
- New route: `POST /api/one-to-one/translate?source=hi-IN&target=kn-IN` with the raw audio bytes as the request body (`express.raw({ type: '*/*', limit: '25mb' })`, scoped to this route only — global `express.json()` in `app.ts` is untouched). New files: `routes/oneToOne.routes.ts`, `controllers/oneToOne.controller.ts`, mounted in `routes/index.ts`. Controller validates query params + body presence (400 on either missing), then calls `transcribeAudio` → `translateText`, returns `{ transcript, translatedText }`.
- Verified against the real API: booted the dev server, POSTed the existing `test-assets/sarvam demo trimmed.mp3` fixture directly — got back the correct Hindi transcript + Kannada translation (same output as `prove-sarvam.ts`). Also verified both 400 paths (missing query params, missing body). `tsc --noEmit` clean.

**Pending / not yet built (Phase 2):**
- Frontend: `apps/web` needs to record a clip (silence/VAD or manual stop trigger, given the ~30s REST clip cap noted in Phase 1), POST it to this endpoint, and render `{ transcript, translatedText }`.
- Sarvam support message about the realtime-WS `invalid_subscription_key` blocker — still not sent (see entry below); once resolved, revisit whether to switch 1-1 mode to the streaming relay or keep batch mode (it may be good enough).

## 2026-08-23 — Robustness fix + re-confirmed: still blocked on Sarvam realtime access

- Found a real crash bug while re-testing: `transcription.service.ts`'s `sendAudioChunk` called `sendRealtimeAudioInput` unconditionally, which throws if the underlying socket isn't open (e.g. mid-reconnect). Since nothing caught it, an uncaught exception took down the entire `node` process — one flaky/rejected connection would have killed every active session, not just the one that failed. Fixed: `sendAudioChunk` now checks `socket.readyState !== WS.OPEN` and silently drops the chunk instead of throwing. Also surfaced Sarvam's `event: "error"` protocol messages to the console (previously only `transcript.final` was handled; auth/protocol errors were silently ignored).
- Reran `prove-realtime.ts` after the user reported seeing billing usage and asked about a "realtime access" toggle. The usage graph they saw was from the REST `prove-sarvam.ts` run (labeled "Saaras v3"), not the realtime one — re-running the actual realtime script shows it's still rejected: `invalid_subscription_key` (WS close code 1003), retried automatically by the SDK's reconnect logic and failing identically every time. No toggle for this was visible on the Sarvam API Keys dashboard page (screenshot showed only the key list, no scopes/permissions column).
- **Still blocked, action needed (user, not code):** find where Sarvam gates realtime-streaming access for this key — try their Model Catalogue page, Pricing page, or contact Sarvam support directly and ask specifically why `saaras:v3-realtime` returns `invalid_subscription_key` while REST `saaras:v3` and Mayura work fine on the same key.

## 2026-08-23 — Phase 2 proof script run: relay confirmed working, blocked on Sarvam account access

- Added `apps/api/src/scripts/prove-realtime.ts` — spins up the gateway on a local test port, converts the existing `test-assets/sarvam demo trimmed.mp3` fixture to raw 16kHz mono PCM via `ffmpeg`, streams it into the relay as ~100ms binary chunks over a real WS client, and logs whatever comes back.
- Ran it against the real Sarvam API. Result: our side of the pipeline works correctly — WS connects, `Welcome` message received, audio chunks forwarded into the Saaras socket, and the socket's `message`/`close` events are received and parsed as expected (added a `close` handler to `transcription.service.ts` for this — was previously silent on unexpected disconnects).
- **Blocked**: Sarvam's realtime WS endpoint rejects the current `SARVAM_API_KEY` with `{"event":"error","code":"invalid_subscription_key","status_code":401}`. The same key works fine for the REST speech-to-text and text-translate endpoints (re-verified via `prove-sarvam.ts` in this session) — so this looks like the account/plan doesn't have realtime streaming access enabled, not a bad key or a code bug.
- **Action needed (user, not code):** check the Sarvam API dashboard for realtime-streaming access/plan enablement on this key before Step 4 can be verified end-to-end.

## 2026-08-23 — Phase 2 Step 4 complete: gateway wired to the real relay

- `apps/api/src/ws/oneToOne.gateway.ts` no longer echoes — `handleOneToOneConnection` now reads `?source=..&target=..` off `req.url`, opens a Saaras stream via `openSaarasStream(sourceLanguageCode, ...)`, forwards incoming **binary** WS frames from the browser into it as base64 (buffering any that arrive before the async `openSaarasStream` resolves), and on each final transcript calls `translateText` and sends `{ type: 'translation', text }` back to the browser. Closes the Saaras socket on `ws.on('close')`. Missing/invalid query params get an error message + immediate close. `tsc --noEmit` clean.
- Written by Claude at the user's request.
- Protocol decided (not yet used by any frontend code — `apps/web` doesn't speak to this gateway yet): direction via query params on the WS URL, audio in as raw binary frames, results out as JSON text frames (`{type: 'translation' | 'error' | 'Welcome', ...}`).

**Pending / not yet built (Phase 2):**
- Frontend: connect `apps/web` to this WS endpoint — capture mic audio, chunk it, send as binary frames; render incoming `translation` messages live.
- `scripts/prove-realtime.ts` — end-to-end proof script with a 16kHz mono PCM WAV fixture, to validate the relay against the real Sarvam API before wiring the frontend.
- Two open decisions carried over: confirm the query-param direction handshake is what the frontend should actually use, and lock in Mayura translate mode (`code-mixed` vs `formal`).

## 2026-08-23 — Phase 2 Step 4: Sarvam realtime STT helper (`transcription.service.ts`)

- `apps/api/src/services/transcription.service.ts` now implemented — the realtime-STT counterpart to `translation.service.ts`. Exports `openSaarasStream(languageCode, onFinalTranscript)`, which opens `sarvamClient.speechToTextRealtimeStreaming` (`saaras:v3-realtime`, keyed off `env.sarvamApi`), listens for `transcript.final` events and calls `onFinalTranscript(text)` for each, awaits the socket actually being open, then hands back `{ sendAudioChunk, close }` for a caller to drive. Deliberately ignores partial transcripts — only finals get surfaced, so the gateway won't re-translate mid-utterance. `tsc --noEmit` clean.
- Written by Claude at the user's request (earlier stub was hand-written and had a syntax error).

**Pending / not yet built (Phase 2):**
- Wire `ws/oneToOne.gateway.ts` to use `openSaarasStream`, replacing the current echo handler: parse direction from `req.url`, open the stream with the source language, forward incoming browser audio chunks into `sendAudioChunk`, and on each final transcript call `translateText` + send the result back over the browser WS. Close the Saaras socket on `ws.on('close')`.
- `scripts/prove-realtime.ts` — end-to-end proof script with a 16kHz mono PCM WAV fixture.
- Two open decisions carried over: direction handshake shape (query params vs. first message) and Mayura translate mode (`code-mixed` vs `formal`).

## 2026-08-20 — Phase 2 Step 4 (partial): extract WS connection handler into its own gateway file

- Pulled the inline `wss.on('connection', ...)` echo handler out of `server.ts` into `apps/api/src/ws/oneToOne.gateway.ts` (`handleOneToOneConnection`), matching the codebase's thin-entrypoint / logic-lives-in-its-own-module pattern. `server.ts` now just creates the `http.Server` + `WebSocketServer` and wires the connection event to the imported handler.
- Still echo-only — no real Sarvam relay logic yet. Verified: `tsc --noEmit` clean, server boots, `GET /api/health` still responds.

**Pending / not yet built (Phase 2):**
- Replace the echo handler in `ws/oneToOne.gateway.ts` with the actual relay: browser WS → Sarvam realtime STT WS → `translateText` → back to browser WS.
- `scripts/prove-realtime.ts` — end-to-end proof script with a 16kHz mono PCM WAV fixture.
- Two open decisions: direction handshake shape (query params vs. first message) and Mayura translate mode (`code-mixed` vs `formal`).

## 2026-08-20 — Phase 2 Step 3: explicit HTTP server + WebSocket upgrade

- `apps/api/src/server.ts` no longer uses the implicit `app.listen(...)`. It now wraps Express in an explicit `http.Server` via `createServer(app)`, then attaches a `ws.WebSocketServer` to that same server so it can handle the WebSocket upgrade handshake.
- Went a step further than originally scoped: rather than stopping at just the bare `http.Server`, also wired up a first WebSocket connection handler inline in `server.ts` (`wss.on('connection', ...)` with message/close/error logging and an echo response) to prove the upgrade path works end-to-end before building the real Sarvam relay.
- Reviewed for bugs: none functional — `tsc --noEmit` clean, `pnpm dev:api` boots and `GET /api/health` still responds `{"status":"ok"}`. Fixed two boot-log typos ("listning" → "listening").
- Structural note carried forward: the connection handler currently lives inline in `server.ts` rather than in its own `ws/oneToOne.gateway.ts` file (the original Step 4 plan). Fine for now while proving the echo path; worth extracting once real Sarvam-relay logic replaces the echo.

(Superseded by the 2026-08-20 Step 4 entry above — connection handler now lives in `ws/oneToOne.gateway.ts`.)

## 2026-08-20 — Phase 2 kickoff: streaming pipeline dependency added

- Added `ws` + `@types/ws` to `apps/api` (Step 0 of the Phase 2 build plan).
- Step 1 done: `apps/api/src/config/sarvam.ts` now holds the single exported `sarvamClient` instance (mirrors the `env.ts` pattern). `prove-sarvam.ts` updated to import it instead of constructing its own client — re-ran against the real API, same Hindi transcript → Kannada translation as before.
- Confirmed `code-mixed` translate mode still leaves English words untranslated in real output (e.g. "sunshine", "clothes", "personal project") — still need to compare against `formal` mode before Step 2.
- Step 2 started: scaffolded empty `apps/api/src/services/translation.service.ts` (file created, no implementation yet).
- Fixed `apps/api/tsconfig.json`: `moduleResolution: "node"` (and its alias `"node10"`) is deprecated on TypeScript 5.9, slated for removal in TS 7.0. Switched `module`/`moduleResolution` to `"nodenext"` (the current recommended pairing for a plain CommonJS Node backend — `apps/api/package.json` has no `"type": "module"`, so this resolves identically to before). Verified `tsc` still emits CommonJS (`require`/`exports`) output and `dist/server.js` runs the same as before.
- That resolution change surfaced 2 real (pre-existing, previously masked) type errors in `translation.service.ts`: `sourceLanguageCode`/`targetLanguageCode` were typed as plain `string` instead of the Sarvam SDK's `SarvamAI.TranslateSourceLanguage` / `TranslateTargetLanguage` literal unions. Narrowed the param types to match; `tsc --noEmit` now passes clean.
- Step 2 done: `translation.service.ts` exports `translateText({ text, sourceLanguageCode, targetLanguageCode, ... })`, wrapping the Mayura call with sane defaults (`numeralsFormat: "native"`, `mode: "code-mixed"`) and no swallowed errors. `prove-sarvam.ts` was missing the actual switch-over — it still had its own inline `sarvamClient.text.translate(...)` call, so the service existed but nothing used it. Updated `prove-sarvam.ts` to import and call `translateText` instead; re-ran against the real API, same transcript/translation output as before, `tsc --noEmit` clean.

(Superseded by the 2026-08-20 Step 3 entry above — `server.ts` restructure is done.)

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
