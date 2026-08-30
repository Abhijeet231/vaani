import { Component, OnInit, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { WaitlistService } from '../../core/waitlist.service';

interface TickerWord {
  word: string;
  font: string;
}

// "listen", one per language — order matters for the visual rhythm (see the
// design handoff). Each word renders in its own script font.
const TICKER: TickerWord[] = [
  { word: 'सुनो', font: "'Noto Sans Devanagari', serif" },
  { word: 'শোনো', font: "'Noto Sans Bengali', serif" },
  { word: 'கேள்', font: "'Noto Sans Tamil', serif" },
  { word: 'విను', font: "'Noto Sans Telugu', serif" },
  { word: 'ಕೇಳು', font: "'Noto Sans Kannada', serif" },
  { word: 'കേൾക്കൂ', font: "'Noto Sans Malayalam', serif" },
  { word: 'સાંભળ', font: "'Noto Sans Gujarati', serif" },
  { word: 'ਸੁਣੋ', font: "'Noto Sans Gurmukhi', serif" },
  { word: 'سنو', font: "'Noto Naskh Arabic', serif" },
  { word: 'ଶୁଣ', font: "'Noto Sans Oriya', serif" },
  { word: 'ऐक', font: "'Noto Sans Devanagari', serif" },
  { word: 'শুনা', font: "'Noto Sans Bengali', serif" },
  { word: 'शृणु', font: "'Noto Sans Devanagari', serif" },
  { word: 'listen', font: 'Piazzolla, Georgia, serif' },
];

@Component({
  selector: 'app-waitlist',
  imports: [],
  templateUrl: './waitlist.html',
  styleUrl: './waitlist.scss',
  // Own full-bleed dark canvas with keyframe animations bound partly via inline
  // styles — same reason the landing page opts out (see PROGRESS.md 2026-08-25).
  // Every selector here is `wl-`-prefixed, so no collision risk.
  encapsulation: ViewEncapsulation.None,
})
export class Waitlist implements OnInit {
  // Rendered twice, concatenated — the marquee translates -50% so the second
  // copy lands exactly where the first started, making the loop seamless.
  protected readonly ticker = [...TICKER, ...TICKER];
  protected readonly avatars = ['अ', 'क', 'ब', 'स'];
  protected readonly metrics = [
    { value: '14', label: 'LANGUAGES SUPPORTED' },
    { value: '11', label: 'VOICES, SPEAKER-MATCHED' },
    { value: '290ms', label: 'MEDIAN LATENCY' },
  ];

  protected readonly email = signal('');
  protected readonly done = signal(false);
  protected readonly submitting = signal(false);
  protected readonly error = signal('');
  protected readonly position = signal<number | null>(null);

  // Real signup count from GET /api/waitlist/count. null until it loads (or if
  // the call fails) — the social-proof cluster is hidden while it's null.
  private readonly liveCount = signal<number | null>(null);
  protected readonly hasCount = computed(() => this.liveCount() !== null);
  protected readonly showAvatars = computed(() => (this.liveCount() ?? 0) > 0);
  protected readonly proofText = computed(() => {
    const n = this.liveCount();
    if (n === null) return '';
    if (n === 0) return 'Be the first in line';
    if (n === 1) return '1 person already waiting';
    return `${n.toLocaleString('en-IN')} already waiting`;
  });

  private readonly waitlist = inject(WaitlistService);

  ngOnInit(): void {
    this.waitlist
      .count()
      .then((count) => this.liveCount.set(count))
      .catch(() => {
        /* leave liveCount null — the social-proof cluster just stays hidden */
      });
  }

  protected onInput(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
    if (this.error()) this.error.set('');
  }

  protected async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const email = this.email().trim();
    if (!email || this.submitting()) return;

    this.submitting.set(true);
    this.error.set('');
    try {
      const res = await this.waitlist.join({ email });
      this.position.set(res.position);
      this.liveCount.set(res.position);
      this.done.set(true);
    } catch (err: unknown) {
      this.error.set(this.messageFor(err));
    } finally {
      this.submitting.set(false);
    }
  }

  private messageFor(err: unknown): string {
    const apiError = (err as { error?: { error?: string } })?.error?.error;
    if (typeof apiError === 'string' && apiError) return apiError;
    return "Couldn't reach the server — try again in a moment.";
  }
}
