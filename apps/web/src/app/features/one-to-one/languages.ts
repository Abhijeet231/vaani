export interface Language {
  code: string;
  label: string;
  // The language's own name in its own script. Shown alongside the English
  // label in the /app direction picker — the person being translated *for*
  // often can't read the English name, and they're frequently the one being
  // handed the phone to check the direction is right.
  native: string;
}

// Matches Sarvam's supported BCP-47 codes for Saaras STT / Mayura translate.
export const LANGUAGES: Language[] = [
  { code: 'hi-IN', label: 'Hindi', native: 'हिन्दी' },
  { code: 'en-IN', label: 'English', native: 'English' },
  { code: 'bn-IN', label: 'Bengali', native: 'বাংলা' },
  { code: 'kn-IN', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml-IN', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'mr-IN', label: 'Marathi', native: 'मराठी' },
  { code: 'od-IN', label: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'pa-IN', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'ta-IN', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te-IN', label: 'Telugu', native: 'తెలుగు' },
  { code: 'gu-IN', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'as-IN', label: 'Assamese', native: 'অসমীয়া' },
  { code: 'ur-IN', label: 'Urdu', native: 'اردو' },
  { code: 'ne-IN', label: 'Nepali', native: 'नेपाली' },
];

// Sarvam's Bulbul TTS supports a smaller language set than STT/translate —
// gate the speaker button on this instead of assuming every LANGUAGES entry works.
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
