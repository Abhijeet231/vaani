export interface Language {
  code: string;
  label: string;
}

// Matches Sarvam's supported BCP-47 codes for Saaras STT / Mayura translate.
export const LANGUAGES: Language[] = [
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'en-IN', label: 'English' },
  { code: 'bn-IN', label: 'Bengali' },
  { code: 'kn-IN', label: 'Kannada' },
  { code: 'ml-IN', label: 'Malayalam' },
  { code: 'mr-IN', label: 'Marathi' },
  { code: 'or-IN', label: 'Odia' },
  { code: 'pa-IN', label: 'Punjabi' },
  { code: 'ta-IN', label: 'Tamil' },
  { code: 'te-IN', label: 'Telugu' },
  { code: 'gu-IN', label: 'Gujarati' },
  { code: 'as-IN', label: 'Assamese' },
  { code: 'ur-IN', label: 'Urdu' },
  { code: 'ne-IN', label: 'Nepali' },
];

// Sarvam's Bulbul TTS supports a smaller language set than STT/translate
// (and Odia uses "od-IN" here, not the "or-IN" used elsewhere) — gate the
// speaker button on this instead of assuming every LANGUAGES entry works.
export const TTS_SUPPORTED_LANGUAGE_CODES = new Set([
  'bn-IN',
  'en-IN',
  'gu-IN',
  'hi-IN',
  'kn-IN',
  'ml-IN',
  'mr-IN',
  'od-IN',
  'pa-IN',
  'ta-IN',
  'te-IN',
]);
