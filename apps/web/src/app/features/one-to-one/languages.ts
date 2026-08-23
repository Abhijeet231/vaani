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
