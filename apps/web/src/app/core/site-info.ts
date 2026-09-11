// Single source of truth for vaani's public contact + business identity, shown
// on /contact and the legal pages. Kept in its own module (no component, no
// Angular imports) so every page can pull from one place without an import cycle.

export const CONTACT_EMAIL = 'ghoshabhijeet778@gmail.com';

// vaani is run by an individual operating as a sole proprietor (no registered
// company) — Abhijeet Ghosh, building it solo. `legalName` is his real legal
// name, used as-is (satisfies what Razorpay's activation review wants there).
//
// No `address` or `phone` here (user's call, 2026-09-09) — this is a public
// page, not a KYC form, and those go directly into Razorpay's own dashboard
// when that review happens; they don't need to be readable by visitors too.
// `isPlaceholder`/`.ph-pill` stay wired to `legalName` and `gstin` in case
// either is ever unset back to a PLACEHOLDER string.
//
// `entityType` here is deliberately the public-facing framing ("Indie
// developer") rather than the formal "sole proprietor" — this field is
// display copy read by visitors, not something Razorpay parses off the page;
// the formal entity type is declared directly in Razorpay's own KYC form.
export const BUSINESS_INFO = {
  legalName: 'Abhijeet Ghosh',
  entityType: 'Indie developer',
  // GSTIN if registered; leave '' if not GST-registered (common for a small
  // proprietorship below the threshold) and the GST line is simply omitted.
  gstin: '',
} as const;

export function isPlaceholder(value: string): boolean {
  return value.startsWith('PLACEHOLDER');
}

// The person behind vaani, and where to find him — shown as a short bio line
// under the business-identity block (privacy, terms, contact) so "who runs
// vaani" reads as one indie developer's project, not a faceless company.
export const BUILDER = {
  name: 'Abhijeet Ghosh',
  site: 'https://abhijeetghosh.site',
  siteLabel: 'abhijeetghosh.site',
} as const;

// How many free turns a new account gets. Must be kept in step with
// FREE_TRIAL_TURNS in apps/api/src/config/pricing.ts, which is what actually
// grants them — the two apps share no code, so this is the web-side mirror.
//
// It lives here because the number is stated in three places (/pricing, the
// FAQ on the landing page, and the Terms), and all three were still advertising
// 10 for a day after the API dropped to 3 (since restored to 10). One
// constant, one edit.
export const FREE_TRIAL_TURNS = 10;
