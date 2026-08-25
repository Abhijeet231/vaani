# Progress Log

## 2026-08-25 — Cursor sparks no longer spawn/render over the "Powered by Sarvam AI" badge

- User reported the hero's cursor-triggered spark particles (random Indic glyphs arcing up from the pointer) were flying over the new "Powered by Sarvam AI" badge, which reads as visual noise on a small trust element.
- `landing.ts`: added a `badgeEl` reference (queries `.vh-powered-badge`), following the exact same pattern already used to exclude the nav and hero card — excluded from spawn (`onMove` returns early over its bounding box) and from render (particles are despawned early if they drift into its box in the animation `tick`), same as `navBox`/`cardBox`.
- Verified: `tsc --noEmit` clean, dev server rebuilt clean.

## 2026-08-25 — Waveform-baseline section dividers between landing sections

- User specified an exact hairline divider design: a full-width 1px rule broken at center by 5 short vertical ticks rising from the baseline (4/7/11/7/4px, colors stepping `#2F2C39` → `#3B3849` → `#6FD3C0` teal accent at the peak) — meant to read like an audio waveform's baseline, echoing the waveform motif used throughout the rest of the page (hero card, wave demo panel).
- Added `.vh-divider`/`.vh-divider-inner`/`.vh-divider-rule`/`.vh-divider-tick(-sm|-md|-lg)` to `landing.scss` (flex row, `align-items: flex-end`, the two `flex:1` hairlines keep the tick cluster centered at any width, container height fixed to the tallest tick at 11px) and inserted the markup (`aria-hidden="true"`, no shared component needed — it's a fixed 7-span structure reused verbatim) between all three landing section boundaries in `landing.html`: hero→languages, languages→difference, difference→faq. Same `max-width: 1060px` / `32px` side padding as the sections it sits between; adds no vertical margin of its own, per spec — rhythm comes from the adjacent sections' existing padding.
- Verified: `tsc --noEmit` clean, dev server rebuilt clean. Confirmed in a real browser (zoomed screenshot) that the divider renders centered under the hero, with the teal center tick and symmetric step-up on both sides matching the spec exactly.

## 2026-08-25 — Hero section tightened to fit one viewport; added "Powered by Sarvam AI" badge

- User asked to fit the hero's headline, tagline, and waveform card in the first viewport (no scroll needed to see the wave card), and to swap the generic eyebrow/subhead copy for something shorter plus a Sarvam AI trust badge.
- `landing.html`/`landing.scss`: removed the `live · no install · 11 Indian languages` eyebrow line entirely. Replaced the two-line subhead (`vaani listens in one language and replies in another...`) with a single short line — "14 Indian languages. Built for India, not adapted to it." — plus a new `.vh-powered-badge`: a small bordered pill (logo + "Powered by **Sarvam AI**", links out to sarvam.ai) styled after "Backed by Y Combinator"-style badges. The Sarvam logo (`sarvam_ai_logo.jpg`, provided by the user) is now `apps/web/public/sarvam-logo.jpg`, served at `/sarvam-logo.jpg`.
- Shrunk the hero waveform card (`.vh-card` and children) to roughly 0.6x its previous box dimensions (max-width 700px → 420px, padding/gaps/border-radius/bar-area height all scaled down together) — text sizes were held a bit above the strict 0.6x scale to stay legible. Updated `heroBars()` in `landing.ts` so its bar-height math (previously based on a 96px-tall container) now targets the new 58px bar area, keeping the waveform's proportions correct instead of over/underflowing the shrunk container.
- Also tightened `.vh-hero` padding (124px 32px 80px → 88px 32px 40px), `.vh-hero-content` gap (44px → 24px), and `.vh-headline` gap (20px → 14px) so the now-shorter content stack (headline, tagline, badge, smaller card, CTA) comfortably fits a real laptop-height viewport (verified at 1568×709) without scrolling — the CTA button and start of the next section are now visible with a light scroll, versus previously extending past the fold.
- Verified: `tsc --noEmit` and `ng build` clean (same pre-existing bundle-size budget warning as before, unrelated). Drove the real page in a browser: badge renders with the Sarvam logo and links out correctly, card retains its proportions just smaller, no console errors, confirmed the full hero stack (headline → tagline → badge → card → CTA) is visible in one screen at a representative laptop viewport height.

**Pending / not yet built:**
- Mobile/narrow-viewport check still outstanding for this reworked hero specifically (carried-over automation limitation, same as noted for the rest of the landing page).

## 2026-08-25 — Fixed real bug: landing page's JS-driven animations were inert

- User reported the background script glyphs weren't floating and the waveform bars weren't animating on the new landing page. Root cause: Angular's emulated view encapsulation renames every `@keyframes` at-rule in a component's compiled stylesheet (e.g. `vaaniFloat` → `_ngcontent-ng-xxx_vaaniFloat`) and rewrites any `animation:`/`animation-name` references *inside that same stylesheet* to match — but `landing.ts` builds several animation values as plain strings at runtime (`'vaaniBar ' + bar.dur + ' ...'`) and binds them via `[style.animation]`. Angular has no way to rewrite those dynamic runtime strings, so they kept referencing the original unscoped names, which no longer matched anything in the compiled CSS. The browser silently no-ops an `animation-name` with no matching `@keyframes` — no console error, `animation-play-state` even still reports `"running"`, which is why this wasn't obvious from a glance. Animations declared as static CSS classes (nav pill, FAQ `+` rotation, language sticky-panel float, pulse dot) were unaffected, since those references live in the same stylesheet Angular rewrites consistently.
- Fix: added `encapsulation: ViewEncapsulation.None` to the `Landing` component (`landing.ts`) so keyframe names are left exactly as authored. Safe here since every class and keyframe in `landing.scss` uses a unique `vh-`/`vaani` prefix — no collision risk with the rest of the app.
- Verified via the browser's Web Animations API directly (`element.getAnimations()`, scrubbing `currentTime`) rather than eyeballing playback: confirmed `@keyframes` names are now unscoped and match, and that scrubbing a background glyph's animation and a waveform bar's animation both interpolate exactly per their keyframes (translateY -9px → 0 → 9px; scaleY 0.28 → 1). Could not visually confirm smooth real-time playback in this session's browser tab — it reports `document.hidden: true` even though it's the active tab, a pre-existing automation-environment quirk already documented in the 2026-08-23 GSAP entry (there it froze `requestAnimationFrame`; here Chrome throttles CSS animation playback the same way on a backgrounded tab). The Web Animations scrub proves the fix is correct independent of that limitation.

**Pending / not yet built:**
- User should eyeball the live page themselves to confirm the animations play smoothly in a normal (non-automated) browser tab — automation can prove correctness but not smoothness/feel here, same caveat as the earlier GSAP entrance animation.

## 2026-08-25 — Landing page rebuilt from the "Vaani Hero" Claude Design canvas

- Imported `Vaani Hero.dc.html` from the user's published Claude Design project (`claude.ai/design/p/be7e9949-...`) via the DesignSync/claude_design MCP and reimplemented it as the real Angular landing page — this fully replaces the previous light-body/dark-hero-band landing built 2026-08-23. New landing is one continuous dark page (`#1C1B1F` ground, `#92A9E1` lavender accent, `#EDEBF7` ink) across all four sections: hero, a "14 languages, 11 with voice" language explorer, a scroll-linked "how it differs" section, and a 9-item FAQ accordion.
- **Theme**: repointed `.theme-lavender` in `styles.scss` from its original light-ground experiment to this dark palette (`color-scheme: dark` now) — same class name, same route (`data.theme: 'lavender'` on `''`), new colors. Not touching `/about`, `/pricing`, `/contact`, or `/app`.
- **Chrome**: the new hero design has its own nav — a wordmark + links that morphs into a floating pill on scroll (shrinks, gains a background/border, centers, hides links below 660px of its own width) — which would double up with the app-wide `mat-toolbar`. Added a `hideChrome: true` route-data flag (landing only); `app.ts`/`app.html` skip rendering the shared toolbar when it's set. Verified `/about`, `/app` etc. still show the normal toolbar unaffected.
- **Interactions ported from the design's script** (originally a Claude-Design/omelette pseudo-React component) into plain Angular signals + imperative DOM/canvas code in `landing.ts`, matching this codebase's existing imperative style for real side effects (same pattern as `one-to-one.ts`'s MediaRecorder use): auto-cycling hero waveform card (11 language-pair examples, 3.2s), a 14-language explorer with click-to-pin selection, a scramble-in text effect on the active glyph display (`Intl.Segmenter` grapheme splitting, ported 1:1), a scroll-position-driven active step in the "how it differs" section (nearest-to-viewport-center wins, polled + scroll-listened), and a cursor-triggered spark-particle canvas in the hero (spawns random Indic-script glyphs that arc and fade, avoiding the nav/card hitboxes). Where the original relied on a React `key` prop to force an animation replay on content change, used Angular's `@for`/`track` to get the same DOM-remount effect.
- Two small, deliberate deviations from the design file, both noted for honesty: the nav's third link was labeled "Payment" in the mockup with no corresponding page — relabeled to "Pricing" pointing at the real `/pricing` route; and "Log in" has no auth to back it yet, so it's wired to `/app` (same destination as "Start free") until Firebase Auth exists — ties into the auth work discussed in this session. The "Sarvam logo" image-slot in the differentiation section's code-switch panel had no actual asset attached in the design file, so it's rendered as plain mono text ("Sarvam AI") rather than a placeholder graphic.
- Added the Google Fonts the design needs (Inter, IBM Plex Mono, Noto Sans Devanagari/Kannada/Tamil/Bengali/Telugu/Malayalam/Gujarati/Gurmukhi/Oriya, Noto Naskh Arabic) to `index.html`, alongside the existing Piazzolla/Hanken Grotesk.
- Raised `angular.json`'s `anyComponentStyle` budget (4kB/8kB &rarr; 16kB/20kB) — `landing.scss` is ~14kB, mostly exact-hex one-off design tokens and the animation keyframe set, which don't map onto the shared `--mat-sys-*`/`--color-*` token system. Noting the growth rather than fighting it, same as the GSAP bundle-size note from 2026-08-23.
- Verified: `tsc --noEmit` and `ng build` clean (only the pre-existing initial-bundle-size warning, unrelated). Drove the real page in a browser: hero renders with the animated background glyphs and cycling waveform card, nav pill correctly morphs on scroll, language explorer responds to clicks (scramble effect, sticky panel updates), "how it differs" correctly tracks scroll position and swaps the sticky demo panel, FAQ accordion opens/closes. Confirmed `/about` and `/app` still render their normal toolbar and are visually unaffected by the `hideChrome` change. No console errors on load.

**Pending / not yet built:**
- Cursor-spark canvas and nav-shrink behavior were verified structurally (canvas draws, nav style bindings change on scroll) but not eyeballed for smoothness/feel by a human in a real browser tab — worth a manual look.
- The other three files in the same Claude Design project (`How It Differs - Scroll.dc.html`, `Languages Option A/B/C.dc.html`) were not imported — `Vaani Hero.dc.html` already contained the merged, final version of all four sections, so those look like earlier drafts/options superseded by it. Left untouched in the design project.
- "Log in" and nav "Payment→Pricing" relabel noted above — once Firebase Auth exists, wire "Log in" to a real auth flow instead of aliasing to `/app`.
- Mobile/narrow-viewport check still outstanding for the new landing page specifically (carried-over automation limitation, same as noted for the old nav in earlier entries).

## 2026-08-24 — Fixed real 500 bug: wrong Odia language code in 1-1 mode

- User hit a 500 error while running the app locally. Traced it through the API log to a `400 Bad Request` from Sarvam's translate endpoint: `LANGUAGES` in `apps/web/src/app/features/one-to-one/languages.ts` listed Odia as `or-IN`, but Sarvam's Saaras/Mayura APIs only accept `od-IN` for that language — the code comment right below `TTS_SUPPORTED_LANGUAGE_CODES` already documented this exact mismatch, it just hadn't been applied to the main list. Selecting Odia as source or target sent the invalid code straight through to Sarvam, and since `oneToOne.controller.ts` does no runtime validation on the query params, the resulting error just fell through to Express's generic error handler as a 500.
- Fixed: `LANGUAGES` now uses `od-IN` for Odia, matching `TTS_SUPPORTED_LANGUAGE_CODES`. Also trimmed the now-redundant part of the code comment that called out the old mismatch.
- Verified: Angular dev server rebuilt clean after the change (no compile errors).

**Pending / not yet built:**
- `oneToOne.controller.ts` still passes `req.query.source`/`target` to Sarvam with only a type cast, no runtime validation — any other bad/unsupported code will still surface as an unhandled 500 instead of a clean 400. Worth adding an allowlist check against `LANGUAGES` before calling Sarvam.

## 2026-08-24 — Meta/OG tags added to index.html (placeholder domain)

- Added a real `<meta name="description">`, full Open Graph tag set (`og:title`, `og:description`, `og:type`, `og:site_name`, `og:url`, `og:image`), and Twitter Card tags to `apps/web/src/index.html`. Also fixed the `<title>` (was still the bare "vaani", now "vaani — say it once, hear it back in theirs"). Without these, sharing a vaani link anywhere (WhatsApp, LinkedIn, X, Slack) previously showed a bare/blank link card.
- **`og:url` and `og:image` use a `TODO_DOMAIN` placeholder** — there's no real domain yet. `og:image` also has no actual file behind it yet (`public/og-image.png` doesn't exist — needs an actual 1200×630 designed image, not just the meta tag).
- Verified the tags land correctly in the compiled `dist/web/browser/index.html` via `ng build` + grep.

**Pending / not yet built:**
- **User asked to be reminded once the project is done / ready to go live**: swap `TODO_DOMAIN` in `index.html` for the real domain (two `og:url`/`og:image` values, one `twitter:image`), and create the actual `og-image.png` asset. Saved as a project memory too so this surfaces proactively in a future session, not just here.

## 2026-08-23 — Dark hero band on landing (lavender-on-graphite, as originally moodboarded)

- User asked what combining both moodboard colors on one page (light lavender page + dark graphite section) would look like, rather than treating graphite as pure text-ink. Restructured the landing hero into a full-bleed dark band (`landing.html`'s `.hero-dark` wrapper, styled in `landing.scss`) with the light preview card floating on top — lavender reads brighter on the dark ground than the deepened `#4a5fa8` text variant needed on light backgrounds, so this is arguably a better use of the color than the all-light version from the previous entry. Rest of the page (How it works, features, closing CTA) stays on the existing light `.theme-lavender` background — one dark band up top, not a full dark page.
- **Found and fixed a real bug this surfaced**, not a testing artifact: the preview card's un-classed text (`Hindi`/`Kannada` labels, the Kannada translated line) has no explicit color of its own, so it was inheriting `.hero-dark`'s near-white text color straight through the light card and rendering almost invisible against the light card background. Fixed with `.hero-card { color: var(--color-ink); }` in `landing.scss`, resetting the card's own text color explicitly rather than letting it inherit from its dark ancestor. Caught via a real screenshot at full opacity, not the earlier reveal-animation confusion — this one was genuinely wrong on screen, not a rAF-throttling artifact.
- Verified: `ng build`/`tsc --noEmit` clean; confirmed in a real browser with a saved screenshot (sent to the user) — dark hero, legible light card, lavender accent on the CTA/swap-icon/speaker-icon, and a clean transition into the light "How it works" section below.

**Pending / not yet built:**
- **Decision needed from user**: keep this dark-hero/light-body landing structure, or revert. Still undecided (from the previous entry) whether Lavender Haze extends to About/Pricing/Contact/App or stays landing-only.
- Real contact email and a manual mobile-nav check are still outstanding (carried over, unchanged).

## 2026-08-23 — Lavender Haze experiment on landing; fixed a real site-wide icon-color bug

- User liked a "Lavender Haze / Soft Graphite" moodboard palette (#92A9E1 + dark graphite) and asked to see the landing page in it, to compare against Slate Minimal. Added a third scoped theme, `.theme-lavender` in `styles.scss` (same pattern as `.theme-light`), applied only to `''`'s route data (`app.routes.ts`) — `/about`, `/pricing`, `/contact` stay on `.theme-light` (brass), `/app` stays dark. Same Piazzolla/Hanken Grotesk type system throughout — only color tokens differ, to isolate what's actually being judged. Raw `#92A9E1` fails text contrast on a light ground (~2.2:1, computed and checked) the same way raw brass did, so text/icon usage gets a deepened `#4a5fa8` (`$accent-ink-lav`) while `#92A9E1` itself stays the *fill* color for buttons — same split pattern as the brass/light theme.
- **Found and fixed a real, pre-existing bug while checking this**, unrelated to the color pivot: every `<mat-icon>` using a `text-accent-ink`/`text-ink-muted` Tailwind color utility was silently rendering in the default ink color instead, site-wide (pricing checkmarks, landing's feature icons and hero speaker icon, contact's mail icon, the direction-swap icon) — Material's own unlayered `.mat-icon-no-color` CSS was winning the cascade over Tailwind's layered utility, the exact gotcha already documented in `apps/web/CLAUDE.md` but not applied here. Fixed by adding the `!` important modifier to every affected `mat-icon` color class (`text-accent-ink!`, `text-ink-muted!`) across `landing.html`, `pricing.html`, `contact.html`. Confirmed via computed-style checks in a real browser, not just visually — the bug was subtle enough that a screenshot alone didn't clearly show it.
- Verified: `ng build`/`tsc --noEmit` clean; landing (lavender), pricing (light/brass, icon fix), and `/app` (dark, untouched) all checked in a real browser.

**Pending / not yet built:**
- **Decision needed from user**: keep Lavender Haze for the landing page (and possibly extend it to About/Pricing/Contact, replacing brass), or revert to Slate Minimal brass and drop the lavender experiment. Nothing is deleted yet — `.theme-light` (brass) is untouched and still one route-data change away from being restored on `''`.
- Still pending from the previous entry: real contact email, and a manual check of the mobile nav menu on an actual narrow viewport.

## 2026-08-23 — About, Pricing, Contact pages + navbar wiring

- New pages under `apps/web/src/app/features/`: `about/`, `pricing/`, `contact/` — all light theme (`data: { theme: 'light' }` in `app.routes.ts`), all using the shared `appReveal` directive for scroll-in.
  - **About**: honest product-mission copy (why single-device translation, how it works, names the actual Sarvam models used — Saaras/Mayura/Bulbul — and an explicit "where it stands today" section distinguishing built vs. planned). No fabricated company/team backstory — there isn't one to tell yet.
  - **Pricing**: "Free, while it's early" — one card listing what's actually included today. Explicitly no invented tiers/prices; vaani has no monetization model decided yet (confirmed with the user before building this).
  - **Contact**: mailto-based (no backend/email service exists to back a real form). **Email is a placeholder** (`TODO@vaani.app`, in `contact.ts`) — user was mid-way through providing the real address when this was built; swap `CONTACT_EMAIL` once given.
- Factored the landing page's scroll-reveal logic (previously bespoke `querySelectorAll` + `ScrollTrigger` loop in `landing.ts`) out into `apps/web/src/app/shared/reveal.directive.ts` (`Reveal`, selector `[appReveal]`) — same behavior, reusable via one attribute instead of copy-pasted wiring per page. `landing.ts` now only keeps its own bespoke hero-entrance timeline; `landing.html` uses `appReveal` for its scroll sections. This was flagged as pending in the previous entry and is now done.
- Navbar: `app.html`/`app.ts` gained real navigation — About/Pricing/Contact links (`routerLinkActive` for the current-page indicator) plus an "Open vaani" CTA, in the same toolbar that already theme-switches per route. Responsive: full links on `md:` and up, a `mat-menu`-based hamburger below that (`MatMenuModule` added) — **not visually verified narrow** (this session's browser-automation tool couldn't actually shrink the tab's viewport despite `resize_window` reporting success; `innerWidth` stayed at 1536px), so this needs a manual check on a real narrow window/phone.
- Verified: `ng build` and `tsc --noEmit` clean; navigated to all 4 marketing routes plus `/app` in a real browser and confirmed correct theme, content, and nav active-state on each.

**Pending / not yet built:**
- **User: give the real contact email** so `CONTACT_EMAIL` in `contact.ts` can be swapped in (currently a visible `TODO@vaani.app` placeholder on the live Contact page).
- **User: check the mobile nav menu** on an actually narrow viewport — automation couldn't verify it.
- No dedicated 404/not-found route yet (unmatched paths currently just don't match any route — no wildcard `**` route configured).

## 2026-08-23 — Light "soothing" variant for marketing pages + GSAP on the landing page

- Decided the split: `/app` (the actual recorder/translator) stays dark Slate Minimal; the landing page and future About/Contact/Pricing pages get a **light** variant of the same brand — same brass accent + Piazzolla/Hanken Grotesk, warm soft ground instead of charcoal (Wispr-Flow-style calm, without forking into an unrelated second identity). Brass as a *fill* color (buttons) stays identical across both themes; brass as *text* needed a deeper shade (`$accent-ink-light: #8a6a30`) for contrast on a light ground, since the original `#c9a15c` fails as literal text on white.
- `apps/web/src/styles.scss`: added a `.theme-light` block redefining the same `--mat-sys-*` tokens (plus the Tailwind `--color-*` tokens) — no second `mat.theme()` call needed, since it's just CSS custom-property overrides on a wrapping element, which both Material components and Tailwind utilities re-resolve against automatically.
- Route-based theming: `app.routes.ts` routes now carry `data: { theme: 'light' | 'dark' }`; `app.ts` derives a `theme-light`/`theme-dark` class from the active route (via `Router` events + `ActivatedRoute`, as a signal) and `app.html` applies it to a wrapper around both the toolbar and `<router-outlet>`, so the toolbar itself flips too — no jarring dark-navbar-on-light-page seam.
- Added **GSAP** (+ `ScrollTrigger`) to `apps/web`, scoped to marketing pages only (the app UI doesn't need it). Landing page now has a real entrance choreography (headline → subhead → CTA → preview card, staggered) and scroll-triggered reveals on the "how it works" steps and feature grid, all skipped outright under `prefers-reduced-motion`. `ScrollTrigger` instances are killed in `ngOnDestroy` to avoid leaking listeners on navigation.
- Verified: `ng build` and `tsc --noEmit` clean. Confirmed the light theme, toolbar, and both dropdown/card contrast render correctly in a real browser, and confirmed `/app` is untouched (still dark). **Could not visually confirm the GSAP animations playing in real time** — this automation environment's tabs report `document.visibilityState: "hidden"` even when focused, which freezes `requestAnimationFrame` entirely (this is correct, intentional browser/GSAP behavior, not a bug to work around). Traced through partial-tween evidence (fractional opacity/transform values mid-animation) to confirm the timeline and ScrollTrigger wiring are structurally correct; actual smooth playback needs a check in a normal, real browser tab.

**Pending / not yet built:**
- **User: please eyeball the landing page animations yourself** (`http://localhost:4200`) — hero entrance and the scroll-reveals on "how it works"/features — automation couldn't watch them play.
- About, Contact, and Pricing pages — will use the same light theme + GSAP pattern now established here.
- No shared "reveal on scroll" utility/directive extracted yet — the pattern in `landing.ts` is copy-worthy but still one-off; worth factoring into `src/app/shared/` once a second page needs the same scroll-reveal behavior.
- Bundle budget warning in `angular.json` is now further over (GSAP added ~140KB) — not fixed, just noting it's grown; worth revisiting the budget number once the marketing pages are done, rather than chasing it mid-build.

## 2026-08-23 — Landing page; OneToOne moved off root to /app

- New `apps/web/src/app/features/landing/` (`Landing` component): hero (headline, subhead, CTA, a live-styled preview of the actual turn-card UI reusing the real Hindi→Kannada example), a 3-step "How it works" (a genuine sequence, so numbered), a 3-up feature grid (live 1-1 translation, speaker playback, multi-speaker — the last one dimmed and explicitly labeled "Coming soon" since it isn't built, not implied as available), and a closing CTA. All copy is specific to what the product actually does today, not generic SaaS boilerplate.
- Routing changed: landing now owns `''`; the actual recorder/translator (`OneToOne`) moved to `/app`. Toolbar wordmark is now a link back to `/`.
- Verified in a real browser end-to-end: landing renders correctly (hero, steps, features), "Start a conversation" navigates to `/app`, and the translator still works there unchanged. `ng build` clean (same pre-existing bundle-budget warning, now a bit larger from the added routed component).

**Pending / not yet built:**
- About and Contact pages (next, per the user's original 3-page ask) — no nav links to them yet since they don't exist, to avoid dead links.
- No shared header/footer nav component yet between pages — will be worth extracting once About/Contact exist and there's real cross-page navigation to build.

## 2026-08-23 — UI theme locked: "Slate Minimal" + Piazzolla/Hanken Grotesk

- Explored 4 visual directions with the user via two published Artifacts (theme mockups on the real 1-1 screen, then a focused type-pairing comparison once "Slate Minimal" was picked). Locked: **Slate Minimal** palette (charcoal ground, single brass accent) with the "Soft Minimal" type pairing — **Piazzolla** (upright, not italic) for brand/display text, **Hanken Grotesk** for body/UI.
- `apps/web/src/styles.scss`: Angular Material's `mat.theme()` Sass mixin only ships pre-generated M3 tonal palettes (no live hex→palette generation in this version), so it's now used just for typography/density/elevation plumbing (`typography: (plain-family: 'Hanken Grotesk', brand-family: 'Piazzolla', ...)`, `theme-type: dark`) — the actual brand colors are hard-set afterward as `--mat-sys-*` custom-property overrides (primary/surface/outline/etc., all named `$brass`/`$ground`/`$ink`/... at the top of the file) so every Material component renders in our exact hexes instead of an algorithmic approximation. `body`'s `color-scheme` changed from `light` to `dark` — this is a single committed dark theme, not a light/dark toggle (no such toggle was requested).
- `apps/web/src/tailwind.css`: added a `@theme` block (`--color-ground`, `--color-ink`, `--color-brass`, `--font-display`, etc.) numerically in sync with the Material overrides, so Tailwind utility classes and Material components draw from one palette.
- `apps/web/src/index.html`: swapped the Roboto font link for Piazzolla + Hanken Grotesk; fixed the `<title>` (was still the scaffold's "Web").
- `app.html`/`app.scss`: toolbar no longer uses Material's `color="primary"` (would've painted the whole bar brass — too loud for "one considered accent"); wordmark now renders in Piazzolla via a `.wordmark` class instead.
- Verified in a real browser: wordmark, record button, and language-select dropdown all render correctly against the dark ground with legible contrast and the brass accent showing up only on interactive elements. `ng build` clean; confirmed the override hexes actually landed in the compiled CSS via grep.

**Pending / not yet built:**
- Landing, About, and Contact pages — theme is now locked so these can start immediately (user asked to build the landing page next).
- No app favicon set yet (still the CLI-default `favicon.ico`).

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
