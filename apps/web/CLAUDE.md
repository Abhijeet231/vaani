# apps/web — Angular frontend

Angular 22, scaffolded with `ng new --routing --style=scss` (standalone components, which is Angular's current default — there are no NgModules in this app, don't add any).

## Structure

- `src/app/app.ts` / `app.html` / `app.scss` — root standalone component, hosts `<router-outlet>`.
- `src/app/app.routes.ts` — route table.
- Shared, reusable components/services (used by more than one feature) should live under `src/app/shared/` (components) and `src/app/core/` (singleton services, guards, interceptors) — create these folders when the first shared piece exists; don't pre-create empty structure.
- Feature-specific components live next to the routes that use them, e.g. `src/app/features/<feature-name>/`.

## Styling: Angular Material + Tailwind CSS v4

Two systems, two files, kept deliberately separate:

- `src/styles.scss` — Angular Material theming only (the `mat.theme()` M3 token setup). Never put Tailwind directives here.
- `src/tailwind.css` — Tailwind entry point (`@import "tailwindcss";`) and nothing else.

Both are wired into `angular.json`'s `styles` array in that order (`styles.scss` then `tailwind.css`). Tailwind is configured via PostCSS (`.postcssrc.json` → `@tailwindcss/postcss`), which is what the Angular CLI's esbuild builder picks up automatically.

**Convention:** use Angular Material for complex/behavioral components — dialogs, date pickers, tables, menus, snackbars, form controls. Use Tailwind for layout, spacing, sizing, and any custom UI that isn't a Material component. Don't reach for a custom `.scss` file to do what a Tailwind utility class already does.

**Cascade order — why it's set up this way, and the one gotcha:**

Angular Material's own component CSS (card, button, toolbar, etc.) is injected by Angular at runtime as plain, unlayered `<style>` tags — Material does not currently support opting its internals into CSS cascade layers (open upstream limitation). Per the CSS spec, unlayered rules *always* beat layered rules, regardless of source order or specificity.

To keep this predictable:
- `styles.scss` wraps our own Material theme tokens in `@layer mat-theme { ... }`.
- `tailwind.css` loads after it, so Tailwind's own layers (`theme, base, components, utilities`) register with higher priority than `mat-theme`.

This means Tailwind utilities reliably win against anything **we** author in `styles.scss`, and against Material host elements that have no competing rule (e.g. `p-4` on a `<mat-card>` — Material doesn't set host padding, so it just applies).

Where a utility conflicts with a property Material **does** set on the host (e.g. `border-radius` on `mat-card` via `.mat-mdc-card`), the unlayered Material rule wins over a plain layered Tailwind utility. Verified empirically in this scaffold: `rounded-xl` alone was silently overridden by Material's card border-radius; adding Tailwind v4's per-utility important modifier fixed it:

```html
<mat-card class="p-4 rounded-xl!">...</mat-card>
```

Reach for the `!` modifier only when you hit an actual conflict (check computed styles in devtools first) — don't apply it prophylactically to every utility.

## State management

Signals — `signal()` / `computed()` / services with signal-based state. No NgRx or other store library in this app. Keep state as close to where it's used as possible; promote to a shared service under `src/app/core/` only when more than one feature needs it.
