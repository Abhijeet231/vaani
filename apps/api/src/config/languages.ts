// Mirrors apps/web/src/app/features/one-to-one/languages.ts — kept in sync
// manually, no shared package yet (see CLAUDE.md: add one only when web and
// api actually need to share code). Matches Sarvam's supported BCP-47 codes
// for Saaras STT / Mayura translate.
export const SUPPORTED_LANGUAGE_CODES = new Set([
  'hi-IN',
  'en-IN',
  'bn-IN',
  'kn-IN',
  'ml-IN',
  'mr-IN',
  'od-IN',
  'pa-IN',
  'ta-IN',
  'te-IN',
  'gu-IN',
  'as-IN',
  'ur-IN',
  'ne-IN',
]);
