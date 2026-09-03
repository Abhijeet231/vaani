// Single source of truth for vaani's public contact + business identity, shown
// on /contact and the legal pages. Kept in its own module (no component, no
// Angular imports) so every page can pull from one place without an import cycle.

export const CONTACT_EMAIL = 'ghoshabhijeet778@gmail.com';

// vaani is run by an individual operating as a sole proprietor (no registered
// company). The PLACEHOLDER values below MUST be replaced with real details
// before the public launch / Razorpay activation review — see PROGRESS.md.
// Anything left as a PLACEHOLDER string renders with a visible "to be added"
// treatment so it can't ship unnoticed.
export const BUSINESS_INFO = {
  // Full legal name of the proprietor (the person legally responsible for vaani).
  legalName: 'PLACEHOLDER_LEGAL_NAME',
  entityType: 'sole proprietor',
  // Operating address — street / area, city, state, PIN, country.
  address: 'PLACEHOLDER_ADDRESS',
  // Contact phone in international format, e.g. +91 98XXXXXXXX.
  phone: 'PLACEHOLDER_PHONE',
  // GSTIN if registered; leave '' if not GST-registered (common for a small
  // proprietorship below the threshold) and the GST line is simply omitted.
  gstin: '',
} as const;

export function isPlaceholder(value: string): boolean {
  return value.startsWith('PLACEHOLDER');
}
