import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewEncapsulation,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

interface LineExample {
  chain: string;
  transcript: string;
  label: string;
}

interface LangEntry {
  name: string;
  script: string;
  font: string;
  sample: string;
  voice: boolean;
}

interface ScriptFont {
  font: string;
  chars: string;
}

interface BgGlyph {
  top: string;
  left: string;
  font: string;
  size: string;
  color: string;
  ch: string;
  anim: string;
  dur: string;
  delay: string;
}

interface Bar {
  h: string;
  dur: string;
  delay: string;
}

interface FaqItem {
  q: string;
  a: string;
}

interface DifferStep {
  num: string;
  title: string;
  body: string;
}

interface Particle {
  ch: string;
  font: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vr: number;
  life: number;
  ttl: number;
  alpha: number;
}

// Example turn-pairs cycled in the hero waveform card.
const LINES: LineExample[] = [
  { chain: 'हिंदी → ಕನ್ನಡ', transcript: 'नमस्ते, आप कैसे हैं?', label: 'hindi · listening' },
  { chain: 'ಕನ್ನಡ → தமிழ்', transcript: 'ನೀವು ಹೇಗಿದ್ದೀರಿ?', label: 'kannada · speaking' },
  { chain: 'தமிழ் → বাংলা', transcript: 'நீங்கள் எப்படி இருக்கிறீர்கள்?', label: 'tamil · speaking' },
  { chain: 'বাংলা → मराठी', transcript: 'আপনি কেমন আছেন?', label: 'bangla · speaking' },
  { chain: 'मराठी → తెలుగు', transcript: 'तुम्ही कसे आहात?', label: 'marathi · speaking' },
  { chain: 'తెలుగు → ગુજરાતી', transcript: 'మీరు ఎలా ఉన్నారు?', label: 'telugu · speaking' },
  { chain: 'ગુજરાતી → ਪੰਜਾਬੀ', transcript: 'તમે કેમ છો?', label: 'gujarati · speaking' },
  { chain: 'ਪੰਜਾਬੀ → മലയാളം', transcript: 'ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ?', label: 'punjabi · speaking' },
  { chain: 'മലയാളം → ଓଡ଼ିଆ', transcript: 'സുഖമാണോ?', label: 'malayalam · speaking' },
  { chain: 'ଓଡ଼ିଆ → اردو', transcript: 'ଆପଣ କେମିତି ଅଛନ୍ତି?', label: 'odia · speaking' },
  { chain: 'اردو → हिंदी', transcript: 'آپ کیسے ہیں؟', label: 'urdu · speaking' },
];

// 14 supported languages — matches apps/web/src/app/features/one-to-one/languages.ts,
// plus script/sample copy for the language explorer below.
const LANGS: LangEntry[] = [
  { name: 'Hindi', script: 'हिन्दी', font: "'Noto Sans Devanagari',serif", sample: 'नमस्ते, आप कैसे हैं?', voice: true },
  { name: 'English', script: 'English', font: 'Inter,system-ui,sans-serif', sample: 'Hello, how are you?', voice: true },
  { name: 'Bengali', script: 'বাংলা', font: "'Noto Sans Bengali',serif", sample: 'নমস্কার, কেমন আছেন?', voice: true },
  { name: 'Kannada', script: 'ಕನ್ನಡ', font: "'Noto Sans Kannada',serif", sample: 'ನಮಸ್ಕಾರ, ಹೇಗಿದ್ದೀರಿ?', voice: true },
  { name: 'Malayalam', script: 'മലയാളം', font: "'Noto Sans Malayalam',serif", sample: 'നമസ്കാരം, സുഖമാണോ?', voice: true },
  { name: 'Marathi', script: 'मराठी', font: "'Noto Sans Devanagari',serif", sample: 'नमस्कार, कसे आहात?', voice: true },
  { name: 'Odia', script: 'ଓଡ଼ିଆ', font: "'Noto Sans Oriya',serif", sample: 'ନମସ୍କାର, କେମିତି ଅଛନ୍ତି?', voice: true },
  { name: 'Punjabi', script: 'ਪੰਜਾਬੀ', font: "'Noto Sans Gurmukhi',serif", sample: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਕਿਵੇਂ ਹੋ?', voice: true },
  { name: 'Tamil', script: 'தமிழ்', font: "'Noto Sans Tamil',serif", sample: 'வணக்கம், எப்படி இருக்கிறீர்கள்?', voice: true },
  { name: 'Telugu', script: 'తెలుగు', font: "'Noto Sans Telugu',serif", sample: 'నమస్కారం, ఎలా ఉన్నారు?', voice: true },
  { name: 'Gujarati', script: 'ગુજરાતી', font: "'Noto Sans Gujarati',serif", sample: 'નમસ્તે, કેમ છો?', voice: true },
  { name: 'Assamese', script: 'অসমীয়া', font: "'Noto Sans Bengali',serif", sample: 'নমস্কাৰ, কেনে আছে?', voice: false },
  { name: 'Urdu', script: 'اردو', font: "'Noto Naskh Arabic',serif", sample: 'السلام علیکم، آپ کیسے ہیں؟', voice: false },
  { name: 'Nepali', script: 'नेपाली', font: "'Noto Sans Devanagari',serif", sample: 'नमस्ते, कस्तो छ?', voice: false },
];

// Glyph pools the cursor-spark canvas draws from — decorative only.
const SCRIPTS: ScriptFont[] = [
  { font: "'Noto Sans Devanagari', serif", chars: 'अआकखगघचजञटठदधनपफबभमयरलवशषसह' },
  { font: "'Noto Sans Kannada', serif", chars: 'ಅಆಇಕಖಗಚಜಟಡಣತದನಪಬಮಯರಲವಶಸಹಳ' },
  { font: "'Noto Sans Tamil', serif", chars: 'அஆஇஉகஙசஞடணதநபமயரலவழளறன' },
  { font: "'Noto Sans Telugu', serif", chars: 'అఆఇఉకఖగచజటడణతదనపబమయరలవశసహ' },
  { font: "'Noto Sans Bengali', serif", chars: 'অআইউকখগঘচছজটডণতদনপবভমযরলশসহ' },
  { font: "'Noto Sans Gujarati', serif", chars: 'અઆઇઉકખગઘચજટડણતદનપબભમયરલવશસહ' },
];

const STEP_LABELS = ['speech in, speech out', 'built for Indian speech', 'one device', 'single pipeline'];

const DIFFER_STEPS: DifferStep[] = [
  {
    num: '01',
    title: 'Built for speaking, not typing.',
    body: "vaani listens to real speech and replies with real speech — you talk, it translates, you can hear it back. It's not a text box you occasionally speak into.",
  },
  {
    num: '02',
    title: 'Tuned for Indian languages, not adapted to them.',
    body: "vaani runs on Sarvam's models, built for Indian speech from the start. Accents, code-switching between English and your language, and regional turns of phrase come through closer than a general-purpose translator manages.",
  },
  {
    num: '03',
    title: 'Only one person needs the app.',
    body: 'The other person in the conversation never installs anything, never signs in, never touches a screen. They just talk and listen, like they would with anyone else.',
  },
  {
    num: '04',
    title: 'One continuous flow, not separate steps.',
    body: 'Recording, transcription, translation, and spoken playback happen as one pipeline built specifically for a live conversation — not a translator retrofitted with a voice button.',
  },
];

const FAQ: FaqItem[] = [
  {
    q: 'Does the other person need to install vaani too?',
    a: 'No. vaani runs entirely from your device — the other person just talks and listens, the way they would in any normal conversation.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'Not right now. vaani is free and open during early access, no sign-up required.',
  },
  {
    q: 'What languages does it support?',
    a: 'Hindi, English, Bengali, Kannada, Malayalam, Marathi, Odia, Punjabi, Tamil, Telugu, Gujarati, Assamese, Urdu, and Nepali for transcription and translation. Spoken playback (hearing the translation read aloud) currently covers 11 of those — Bengali, English, Gujarati, Hindi, Kannada, Malayalam, Marathi, Odia, Punjabi, Tamil, and Telugu.',
  },
  {
    q: 'Is my conversation recorded or stored anywhere?',
    a: "No. vaani processes audio to transcribe and translate it, but nothing is saved — there's no account, no history, no database behind it right now.",
  },
  {
    q: 'Can it handle a group conversation, not just two people?',
    a: 'Not yet. Right now vaani is built for one-on-one conversations. A multi-speaker mode that follows a whole room and labels who said what is planned next.',
  },
  {
    q: 'Do I have to read the translation, or can I hear it?',
    a: 'Both. The translated text shows up instantly, and you can tap the speaker icon to have it read aloud too.',
  },
  {
    q: 'Does it work offline?',
    a: 'No — vaani needs an internet connection, since translation and speech happen through real speech-AI models, not on your device.',
  },
  {
    q: 'Is it accurate?',
    a: "vaani uses Sarvam AI's speech and translation models, built specifically for Indian languages rather than a generic translator — but like any speech AI, it can still get things wrong, especially with heavy accents, background noise, or very fast speech.",
  },
  {
    q: 'Is there a paid plan?',
    a: "Not yet. vaani is free while it's in early access. Paid plans, if any, will come later and won't change anything for you until announced.",
  },
];

// Decorative background glyph field — 5 rows x 6 cols, brick-offset, aria-hidden.
const BG_GLYPHS: BgGlyph[] = [
  { top: '1.0%', left: '1.0%', font: "'Noto Sans Devanagari',serif", size: '9.5vw', color: '#25242A', ch: 'व', anim: 'vaaniFloat', dur: '14s', delay: '0s' },
  { top: '1.0%', left: '17.4%', font: "'Noto Sans Bengali',serif", size: '12.5vw', color: '#222126', ch: 'অ', anim: 'vaaniDriftA', dur: '19s', delay: '-3s' },
  { top: '1.0%', left: '33.8%', font: "'Noto Sans Gujarati',serif", size: '11.5vw', color: '#242329', ch: 'ગ', anim: 'vaaniDriftB', dur: '24s', delay: '-6s' },
  { top: '1.0%', left: '50.2%', font: "'Noto Naskh Arabic',serif", size: '10.5vw', color: '#232227', ch: 'ب', anim: 'vaaniFloat', dur: '16s', delay: '-9s' },
  { top: '1.0%', left: '66.6%', font: "'Noto Sans Kannada',serif", size: '9.5vw', color: '#25242A', ch: 'ಮ', anim: 'vaaniDriftA', dur: '21s', delay: '-12s' },
  { top: '1.0%', left: '83.0%', font: "'Noto Sans Gujarati',serif", size: '12.5vw', color: '#222126', ch: 'ધ', anim: 'vaaniDriftB', dur: '26s', delay: '-15s' },
  { top: '20.5%', left: '8.0%', font: "'Noto Sans Gurmukhi',serif", size: '11.5vw', color: '#242329', ch: 'ਪ', anim: 'vaaniFloat', dur: '18s', delay: '-1s' },
  { top: '20.5%', left: '24.4%', font: "'Noto Sans Devanagari',serif", size: '10.5vw', color: '#232227', ch: 'ळ', anim: 'vaaniDriftA', dur: '23s', delay: '-4s' },
  { top: '20.5%', left: '40.8%', font: "'Noto Sans Bengali',serif", size: '9.5vw', color: '#25242A', ch: 'ব', anim: 'vaaniDriftB', dur: '15s', delay: '-7s' },
  { top: '20.5%', left: '57.2%', font: "'Noto Sans Telugu',serif", size: '12.5vw', color: '#222126', ch: 'ఇ', anim: 'vaaniFloat', dur: '20s', delay: '-10s' },
  { top: '20.5%', left: '73.6%', font: "'Noto Naskh Arabic',serif", size: '11.5vw', color: '#242329', ch: 'ن', anim: 'vaaniDriftA', dur: '25s', delay: '-13s' },
  { top: '20.5%', left: '90.0%', font: "'Noto Sans Tamil',serif", size: '10.5vw', color: '#232227', ch: 'த', anim: 'vaaniDriftB', dur: '17s', delay: '-16s' },
  { top: '40.0%', left: '1.0%', font: "'Noto Sans Malayalam',serif", size: '9.5vw', color: '#25242A', ch: 'ള', anim: 'vaaniFloat', dur: '22s', delay: '-2s' },
  { top: '40.0%', left: '17.4%', font: "'Noto Sans Gurmukhi',serif", size: '12.5vw', color: '#222126', ch: 'ਸ', anim: 'vaaniDriftA', dur: '14s', delay: '-5s' },
  { top: '40.0%', left: '33.8%', font: "'Noto Sans Devanagari',serif", size: '11.5vw', color: '#242329', ch: 'व', anim: 'vaaniDriftB', dur: '19s', delay: '-8s' },
  { top: '40.0%', left: '50.2%', font: "'Noto Sans Bengali',serif", size: '10.5vw', color: '#232227', ch: 'অ', anim: 'vaaniFloat', dur: '24s', delay: '-11s' },
  { top: '40.0%', left: '66.6%', font: "'Noto Sans Gujarati',serif", size: '9.5vw', color: '#25242A', ch: 'ગ', anim: 'vaaniDriftA', dur: '16s', delay: '-14s' },
  { top: '40.0%', left: '83.0%', font: "'Noto Naskh Arabic',serif", size: '12.5vw', color: '#222126', ch: 'ب', anim: 'vaaniDriftB', dur: '21s', delay: '0s' },
  { top: '59.5%', left: '8.0%', font: "'Noto Sans Kannada',serif", size: '11.5vw', color: '#242329', ch: 'ಕ', anim: 'vaaniFloat', dur: '26s', delay: '-3s' },
  { top: '59.5%', left: '24.4%', font: "'Noto Sans Telugu',serif", size: '10.5vw', color: '#232227', ch: 'త', anim: 'vaaniDriftA', dur: '18s', delay: '-6s' },
  { top: '59.5%', left: '40.8%', font: "'Noto Sans Gurmukhi',serif", size: '9.5vw', color: '#25242A', ch: 'ਪ', anim: 'vaaniDriftB', dur: '23s', delay: '-9s' },
  { top: '59.5%', left: '57.2%', font: "'Noto Sans Devanagari',serif", size: '12.5vw', color: '#222126', ch: 'ळ', anim: 'vaaniFloat', dur: '15s', delay: '-12s' },
  { top: '59.5%', left: '73.6%', font: "'Noto Sans Bengali',serif", size: '11.5vw', color: '#242329', ch: 'ব', anim: 'vaaniDriftA', dur: '20s', delay: '-15s' },
  { top: '59.5%', left: '90.0%', font: "'Noto Sans Telugu',serif", size: '10.5vw', color: '#232227', ch: 'ఇ', anim: 'vaaniDriftB', dur: '25s', delay: '-1s' },
  { top: '79.0%', left: '1.0%', font: "'Noto Sans Oriya',serif", size: '9.5vw', color: '#25242A', ch: 'ଓ', anim: 'vaaniFloat', dur: '17s', delay: '-4s' },
  { top: '79.0%', left: '17.4%', font: "'Noto Sans Tamil',serif", size: '12.5vw', color: '#222126', ch: 'ழ', anim: 'vaaniDriftA', dur: '22s', delay: '-7s' },
  { top: '79.0%', left: '33.8%', font: "'Noto Sans Malayalam',serif", size: '11.5vw', color: '#242329', ch: 'ള', anim: 'vaaniDriftB', dur: '14s', delay: '-10s' },
  { top: '79.0%', left: '50.2%', font: "'Noto Sans Gurmukhi',serif", size: '10.5vw', color: '#232227', ch: 'ਸ', anim: 'vaaniFloat', dur: '19s', delay: '-13s' },
  { top: '79.0%', left: '66.6%', font: "'Noto Sans Devanagari',serif", size: '9.5vw', color: '#25242A', ch: 'व', anim: 'vaaniDriftA', dur: '24s', delay: '-16s' },
  { top: '79.0%', left: '83.0%', font: "'Noto Sans Bengali',serif", size: '12.5vw', color: '#222126', ch: 'অ', anim: 'vaaniDriftB', dur: '16s', delay: '-2s' },
];

function heroBars(): Bar[] {
  const n = 72;
  const bars: Bar[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const env = 0.34 + 0.66 * Math.pow(Math.sin(Math.PI * t), 0.55);
    const detail = 0.55 + 0.45 * Math.abs(Math.sin(i * 1.9) * Math.cos(i * 0.73));
    const jitter = 0.7 + 0.3 * Math.abs((Math.sin(i * 12.9898) * 43758.5453) % 1);
    bars.push({
      h: Math.max(4, Math.round(58 * env * detail * jitter)) + 'px',
      dur: (0.9 + ((i * 37) % 11) / 10).toFixed(2) + 's',
      delay: '-' + (((i * 53) % 19) / 10).toFixed(2) + 's',
    });
  }
  return bars;
}

function waveBars(): Bar[] {
  const n = 28;
  const bars: Bar[] = [];
  for (let i = 0; i < n; i++) {
    const env = 0.3 + 0.7 * Math.pow(Math.sin((Math.PI * i) / (n - 1)), 0.6);
    const jitter = 0.6 + 0.4 * Math.abs((Math.sin(i * 12.9898) * 43758.5453) % 1);
    bars.push({
      h: Math.max(6, Math.round(74 * env * jitter)) + 'px',
      dur: (0.85 + ((i * 31) % 9) / 10).toFixed(2) + 's',
      delay: '-' + (((i * 47) % 17) / 10).toFixed(2) + 's',
    });
  }
  return bars;
}

const HERO_BARS = heroBars();
const WAVE_BARS = waveBars();

function graphemes(s: string): string[] {
  try {
    const seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    return Array.from(seg.segment(s), (p) => p.segment);
  } catch {
    return [s];
  }
}

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
  // Several animations are built as plain strings at runtime (background
  // glyph drift, waveform bars, language-row glitch/flash) and bound via
  // [style.animation]. Angular's emulated encapsulation renames @keyframes
  // in the compiled stylesheet but can't rewrite those runtime strings, so
  // the names stop matching. Disabling encapsulation keeps the keyframe
  // names as-authored — safe here since every class/keyframe in this file
  // uses a unique vh-/vaani prefix.
  encapsulation: ViewEncapsulation.None,
})
export class Landing implements AfterViewInit, OnDestroy {
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  protected readonly lines = LINES;
  protected readonly langs = LANGS;
  protected readonly bgGlyphs = BG_GLYPHS;
  protected readonly heroBars = HERO_BARS;
  protected readonly waveBars = WAVE_BARS;
  protected readonly differSteps = DIFFER_STEPS;
  protected readonly faq = FAQ;

  protected readonly navScrolled = signal(false);
  protected readonly navCompact = signal(false);
  protected readonly lineStep = signal(0);
  protected readonly langIndex = signal(0);
  protected readonly langAuto = signal(true);
  protected readonly scramble = signal(0);
  protected readonly faqOpen = signal<number | null>(null);
  protected readonly stepIndex = signal(0);

  protected readonly activeLine = computed(() => LINES[this.lineStep() % LINES.length]);
  protected readonly activeLang = computed(() => LANGS[this.langIndex()]);

  protected readonly langRows = computed(() => {
    const li = this.langIndex();
    return LANGS.map((lang, n) => {
      const active = n === li;
      const parityA = li % 2 === 0;
      return {
        lang,
        index: n,
        active,
        tone: active ? '#EDEBF7' : '#9C99AC',
        tagTone: lang.voice ? (active ? '#92A9E1' : '#57545F') : '#57545F',
        tag: lang.voice ? 'voice' : 'text',
        bar: active ? '#92A9E1' : 'transparent',
        glitch: active ? `${parityA ? 'vaaniGlitchA' : 'vaaniGlitchB'} .42s steps(1,end) both` : 'none',
        flash: active ? `${parityA ? 'vaaniFlashA' : 'vaaniFlashB'} .6s ease both` : 'none',
        pop: active ? 'vaaniBarPop .32s cubic-bezier(.2,.8,.3,1) both' : 'none',
      };
    });
  });

  protected readonly glyphs = computed(() => {
    const p = this.scramble();
    const al = this.activeLang();
    if (/[؀-ۿ]/.test(al.script)) {
      return [{ ch: al.script, tone: p ? '#4E4B58' : '#EDEBF7' }];
    }
    const real = graphemes(al.script);
    if (!p) {
      return real.map((ch) => ({ ch: ch === ' ' ? ' ' : ch, tone: '#EDEBF7' }));
    }
    const pool = graphemes(al.sample).filter((c) => c.trim() && !'?,.،؟'.includes(c));
    const settled = Math.floor(real.length * p);
    return real.map((ch, k) => {
      if (k < settled) return { ch: ch === ' ' ? ' ' : ch, tone: '#EDEBF7' };
      const r = pool.length ? pool[Math.floor(Math.random() * pool.length)] : ch;
      return { ch: r, tone: '#4E4B58' };
    });
  });

  protected readonly wipeAnim = computed(
    () => `${this.langIndex() % 2 ? 'vaaniWipeA' : 'vaaniWipeB'} .75s cubic-bezier(.22,.61,.36,1) .18s both`
  );

  protected readonly navStyle = computed(() => {
    const on = this.navScrolled();
    return {
      top: on ? '14px' : '0px',
      width: on ? '86%' : '100%',
      'max-width': on ? '1080px' : 'none',
      height: on ? '58px' : '72px',
      'border-radius': on ? '16px' : '0px',
      'background-color': on ? 'rgba(28,27,31,0.92)' : 'rgba(28,27,31,0)',
      'border-color': on ? '#3B3849' : 'rgba(59,56,73,0)',
    };
  });

  protected readonly navInnerStyle = computed(() => {
    const compact = this.navCompact();
    const on = this.navScrolled();
    return {
      padding: compact ? '0 18px' : on ? '0 20px' : '0 34px',
      'grid-template-columns': compact ? '1fr auto' : '1fr auto 1fr',
    };
  });

  protected readonly brandSize = computed(() => (this.navScrolled() ? '18px' : '20px'));
  protected readonly navLinksDisplay = computed(() => (this.navCompact() ? 'none' : 'flex'));
  protected readonly navLoginDisplay = computed(() => (this.navCompact() ? 'none' : 'inline'));

  protected readonly panelLabel = computed(() => STEP_LABELS[this.stepIndex()]);
  protected readonly panelIndex = computed(() => `0${this.stepIndex() + 1} / 04`);

  protected readonly faqRows = computed(() => {
    const open = this.faqOpen();
    return FAQ.map((item, i) => ({ ...item, open: open === i }));
  });

  protected readonly activeMeta = computed(() => (this.activeLang().voice ? 'text and voice' : 'text only'));
  protected readonly activeIndex = computed(() => `${String(this.langIndex() + 1).padStart(2, '0')} / 14`);
  protected readonly activeDot = computed(() => (this.activeLang().voice ? '#92A9E1' : '#57545F'));
  protected readonly chipColor = computed(() => (this.activeLang().voice ? '#B8C6EE' : '#9C99AC'));
  protected readonly activeVoiceLabel = computed(() =>
    this.activeLang().voice ? 'spoken playback available' : 'text output only'
  );
  protected readonly cycleHint = computed(() => (this.langAuto() ? 'cycling' : 'pinned'));

  private heroEl: HTMLElement | null = null;
  private navEl: HTMLElement | null = null;
  private sentinelEl: HTMLElement | null = null;
  private cardEl: HTMLElement | null = null;
  private canvasEl: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private stepEls: HTMLElement[] = [];

  private particles: Particle[] = [];
  private raf: number | null = null;
  private lastFrame = 0;
  private lastSpawn = 0;
  private heroSize = { w: 0, h: 0 };
  private ro: ResizeObserver | null = null;
  private navRO: ResizeObserver | null = null;
  private onMove: ((e: PointerEvent) => void) | null = null;
  private onScroll: (() => void) | null = null;
  private onStepScroll: (() => void) | null = null;
  private resize: (() => void) | null = null;

  private lineTimer: ReturnType<typeof setInterval> | null = null;
  private langTimer: ReturnType<typeof setInterval> | null = null;
  private scrTimer: ReturnType<typeof setInterval> | null = null;
  private navPoll: ReturnType<typeof setInterval> | null = null;
  private stepPoll: ReturnType<typeof setInterval> | null = null;

  private reducedMotion = false;

  ngAfterViewInit(): void {
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const root = this.host.nativeElement;
    this.heroEl = root.querySelector<HTMLElement>('[data-role="hero"]');
    this.navEl = root.querySelector<HTMLElement>('[data-role="nav"]');
    this.sentinelEl = root.querySelector<HTMLElement>('[data-role="sentinel"]');
    this.cardEl = root.querySelector<HTMLElement>('[data-role="card"]');
    this.canvasEl = root.querySelector<HTMLCanvasElement>('[data-role="sparks"]');
    this.stepEls = Array.from(root.querySelectorAll<HTMLElement>('[data-step]'));

    this.lineTimer = setInterval(() => {
      this.lineStep.update((s) => (s + 1) % LINES.length);
    }, 3200);

    this.langTimer = setInterval(() => {
      if (this.langAuto()) {
        this.langIndex.update((i) => (i + 1) % LANGS.length);
        this.startScramble();
      }
    }, 2800);

    this.initNav();
    this.initSteps();
    this.initSparks();
  }

  ngOnDestroy(): void {
    if (this.lineTimer) clearInterval(this.lineTimer);
    if (this.langTimer) clearInterval(this.langTimer);
    if (this.scrTimer) clearInterval(this.scrTimer);
    if (this.navPoll) clearInterval(this.navPoll);
    if (this.stepPoll) clearInterval(this.stepPoll);

    if (this.onScroll) {
      window.removeEventListener('scroll', this.onScroll, true);
      document.removeEventListener('scroll', this.onScroll, true);
    }
    if (this.onStepScroll) {
      window.removeEventListener('scroll', this.onStepScroll, true);
      document.removeEventListener('scroll', this.onStepScroll, true);
      window.removeEventListener('resize', this.onStepScroll);
    }
    this.navRO?.disconnect();
    this.teardownSparks();
  }

  protected selectLang(n: number): void {
    this.langAuto.set(false);
    if (this.langTimer) {
      clearInterval(this.langTimer);
      this.langTimer = null;
    }
    this.langIndex.set(n);
    this.startScramble();
  }

  protected toggleFaq(i: number): void {
    this.faqOpen.update((cur) => (cur === i ? null : i));
  }

  private startScramble(): void {
    if (this.scrTimer) clearInterval(this.scrTimer);
    if (this.reducedMotion) {
      this.scramble.set(0);
      return;
    }
    this.scramble.set(1);
    const started = performance.now();
    this.scrTimer = setInterval(() => {
      const p = (performance.now() - started) / 620;
      if (p >= 1) {
        clearInterval(this.scrTimer!);
        this.scrTimer = null;
        this.scramble.set(0);
      } else {
        this.scramble.set(p);
      }
    }, 55);
  }

  private initNav(): void {
    const nav = this.navEl;
    if (!nav) return;

    const checkNav = () => {
      let scrolled: boolean;
      if (this.sentinelEl) {
        scrolled = this.sentinelEl.getBoundingClientRect().top <= -24;
      } else {
        scrolled = (window.scrollY || document.documentElement.scrollTop || 0) > 24;
      }
      const compact = nav.getBoundingClientRect().width < 660;
      if (scrolled !== this.navScrolled()) this.navScrolled.set(scrolled);
      if (compact !== this.navCompact()) this.navCompact.set(compact);
    };

    this.onScroll = checkNav;
    window.addEventListener('scroll', this.onScroll, { passive: true, capture: true });
    document.addEventListener('scroll', this.onScroll, { passive: true, capture: true });
    this.navPoll = setInterval(checkNav, 150);
    this.navRO = new ResizeObserver(checkNav);
    this.navRO.observe(nav);
    checkNav();
  }

  private initSteps(): void {
    const els = this.stepEls;
    if (!els.length) return;

    const checkSteps = () => {
      const mid = (window.innerHeight || document.documentElement.clientHeight || 0) / 2;
      let best = 0;
      let bestDist = Infinity;
      els.forEach((el, i) => {
        if (bestDist === -1) return;
        const r = el.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) {
          best = i;
          bestDist = -1;
          return;
        }
        const d = Math.min(Math.abs(r.top - mid), Math.abs(r.bottom - mid));
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      if (best !== this.stepIndex()) this.stepIndex.set(best);
    };

    this.onStepScroll = checkSteps;
    window.addEventListener('scroll', this.onStepScroll, { passive: true, capture: true });
    document.addEventListener('scroll', this.onStepScroll, { passive: true, capture: true });
    window.addEventListener('resize', this.onStepScroll, { passive: true });
    this.stepPoll = setInterval(checkSteps, 150);
    checkSteps();
  }

  // ---- cursor spark field: draws a stray script glyph flying up from the pointer ----
  private initSparks(): void {
    const hero = this.heroEl;
    const canvas = this.canvasEl;
    if (!hero || !canvas || this.reducedMotion) return;

    this.particles = [];
    this.lastSpawn = 0;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;

    this.resize = () => {
      const r = hero.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      this.ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.heroSize = { w: r.width, h: r.height };
    };
    this.resize();
    this.ro = new ResizeObserver(this.resize);
    this.ro.observe(hero);

    this.onMove = (e: PointerEvent) => {
      const hb = hero.getBoundingClientRect();
      if (e.clientX < hb.left || e.clientX > hb.right || e.clientY < hb.top || e.clientY > hb.bottom) return;
      const now = performance.now();
      if (now - this.lastSpawn < 120) return;
      this.lastSpawn = now;
      if (this.navEl) {
        const nb = this.navEl.getBoundingClientRect();
        if (e.clientX >= nb.left && e.clientX <= nb.right && e.clientY >= nb.top && e.clientY <= nb.bottom) return;
      }
      if (this.cardEl) {
        const cb = this.cardEl.getBoundingClientRect();
        if (e.clientX >= cb.left && e.clientX <= cb.right && e.clientY >= cb.top && e.clientY <= cb.bottom) return;
      }
      const r = hero.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const n = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < n; i++) this.spawn(x, y);
      const cap = 50;
      if (this.particles.length > cap) this.particles.splice(0, this.particles.length - cap);
      this.start();
    };
    window.addEventListener('pointermove', this.onMove, { passive: true, capture: true });
    document.addEventListener('mousemove', this.onMove as EventListener, { passive: true, capture: true });
  }

  private spawn(x: number, y: number): void {
    const s = SCRIPTS[Math.floor(Math.random() * SCRIPTS.length)];
    const ch = s.chars[Math.floor(Math.random() * s.chars.length)];
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.1;
    const speed = 26 + Math.random() * 58;
    this.particles.push({
      ch,
      font: s.font,
      x,
      y,
      vx: Math.cos(ang) * speed + (Math.random() - 0.5) * 22,
      vy: Math.sin(ang) * speed,
      size: 15 + Math.random() * 9,
      rot: (Math.random() - 0.5) * 0.4,
      vr: (Math.random() - 0.5) * 1.1,
      life: 0,
      ttl: 900 + Math.random() * 350,
      alpha: 0.55 + Math.random() * 0.45,
    });
  }

  private start(): void {
    if (this.raf) return;
    this.lastFrame = performance.now();
    const tick = (t: number) => {
      const dt = Math.min(48, t - this.lastFrame) / 1000;
      this.lastFrame = t;
      const ps = this.particles;
      const ctx = this.ctx!;
      const size = this.heroSize;
      ctx.clearRect(0, 0, size.w, size.h);

      let cardBox: { l: number; r: number; t: number; b: number } | null = null;
      if (this.cardEl && this.heroEl) {
        const cb = this.cardEl.getBoundingClientRect();
        const hb2 = this.heroEl.getBoundingClientRect();
        cardBox = { l: cb.left - hb2.left, r: cb.right - hb2.left, t: cb.top - hb2.top, b: cb.bottom - hb2.top };
      }
      let navBox: { l: number; r: number; t: number; b: number } | null = null;
      if (this.navEl && this.heroEl) {
        const nb = this.navEl.getBoundingClientRect();
        const hb = this.heroEl.getBoundingClientRect();
        navBox = { l: nb.left - hb.left, r: nb.right - hb.left, t: nb.top - hb.top, b: nb.bottom - hb.top };
      }

      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.life += dt * 1000;
        if (p.life >= p.ttl) {
          ps.splice(i, 1);
          continue;
        }
        p.vy += 148 * dt;
        p.vx += Math.sin((p.life + p.size) / 160) * 9 * dt;
        p.vx *= 0.992;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        if (navBox && p.x > navBox.l - 6 && p.x < navBox.r + 6 && p.y > navBox.t - 6 && p.y < navBox.b + 6) {
          ps.splice(i, 1);
          continue;
        }
        if (cardBox && p.x > cardBox.l && p.x < cardBox.r && p.y > cardBox.t && p.y < cardBox.b) {
          ps.splice(i, 1);
          continue;
        }
        const k = 1 - p.life / p.ttl;
        ctx.save();
        ctx.globalAlpha = p.alpha * k * k;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = '#92A9E1';
        ctx.font = p.size + 'px ' + p.font;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.ch, 0, 0);
        ctx.restore();
      }

      if (ps.length) {
        this.raf = requestAnimationFrame(tick);
      } else {
        this.raf = null;
      }
    };
    this.raf = requestAnimationFrame(tick);
  }

  private teardownSparks(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
    this.ro?.disconnect();
    if (this.onMove) {
      window.removeEventListener('pointermove', this.onMove, true);
      document.removeEventListener('mousemove', this.onMove as EventListener, true);
    }
    this.particles = [];
  }
}
