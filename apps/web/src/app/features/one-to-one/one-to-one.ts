import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LANGUAGES, TTS_SUPPORTED_LANGUAGE_CODES } from './languages';
import { AuthService } from '../../core/auth.service';

interface Turn {
  id: string;
  sourceLanguage: string;
  targetLanguage: string;
  transcript: string;
  translatedText: string;
  audioUrl: string | null;
  isSynthesizing: boolean;
}

interface TranslateAudioResponse {
  transcript: string;
  translatedText: string;
  turnsBalance: number;
}

// Volume-threshold silence detection, not real speech detection — good enough
// to stop sending dead air to Sarvam without pulling in a VAD model/library.
// Starting defaults; may need tuning once used for real.
const SILENCE_RMS_THRESHOLD = 0.02;
const SILENCE_DURATION_MS = 1500;
const MIN_RECORDING_BEFORE_AUTO_STOP_MS = 1000;

@Component({
  selector: 'app-one-to-one',
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './one-to-one.html',
  styleUrl: './one-to-one.scss',
})
export class OneToOne {
  private readonly http = inject(HttpClient);
  protected readonly auth = inject(AuthService);

  protected readonly languages = LANGUAGES;
  protected readonly sourceLanguage = signal('hi-IN');
  protected readonly targetLanguage = signal('kn-IN');
  protected readonly isRecording = signal(false);
  protected readonly isProcessing = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly turns = signal<Turn[]>([]);

  protected readonly noTurnsLeft = computed(() => (this.auth.dbUser()?.turnsBalance ?? 1) <= 0);
  protected readonly turnsBalance = computed(() => this.auth.dbUser()?.turnsBalance ?? null);

  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private silenceCheckIntervalId: number | null = null;
  private recordingStartedAt = 0;
  private silenceStartedAt: number | null = null;

  protected flipDirection(): void {
    const source = this.sourceLanguage();
    this.sourceLanguage.set(this.targetLanguage());
    this.targetLanguage.set(source);
  }

  protected async toggleRecording(): Promise<void> {
    if (this.isRecording()) {
      if (this.mediaRecorder?.state === 'recording') {
        this.mediaRecorder.stop();
      }
      return;
    }

    if (this.noTurnsLeft()) {
      return;
    }

    this.errorMessage.set(null);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      this.errorMessage.set('Microphone access denied. Allow mic access to record.');
      return;
    }

    this.audioChunks = [];
    this.mediaRecorder = new MediaRecorder(stream);

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      this.stopSilenceDetection();
      const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
      const blob = new Blob(this.audioChunks, { type: mimeType });
      this.sendAudio(blob);
    };

    this.mediaRecorder.start();
    this.isRecording.set(true);
    this.startSilenceDetection(stream);
  }

  private startSilenceDetection(stream: MediaStream): void {
    this.recordingStartedAt = Date.now();
    this.silenceStartedAt = null;

    this.audioContext = new AudioContext();
    const source = this.audioContext.createMediaStreamSource(stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    source.connect(this.analyser);

    const data = new Uint8Array(this.analyser.fftSize);
    this.silenceCheckIntervalId = window.setInterval(() => {
      if (!this.analyser) return;
      this.analyser.getByteTimeDomainData(data);

      let sumSquares = 0;
      for (const byte of data) {
        const amplitude = (byte - 128) / 128;
        sumSquares += amplitude * amplitude;
      }
      const rms = Math.sqrt(sumSquares / data.length);

      const now = Date.now();
      if (rms < SILENCE_RMS_THRESHOLD) {
        this.silenceStartedAt ??= now;
        const silenceElapsed = now - this.silenceStartedAt;
        const recordingElapsed = now - this.recordingStartedAt;
        if (
          silenceElapsed >= SILENCE_DURATION_MS &&
          recordingElapsed >= MIN_RECORDING_BEFORE_AUTO_STOP_MS &&
          this.mediaRecorder?.state === 'recording'
        ) {
          this.mediaRecorder.stop();
        }
      } else {
        this.silenceStartedAt = null;
      }
    }, 150);
  }

  private stopSilenceDetection(): void {
    if (this.silenceCheckIntervalId !== null) {
      clearInterval(this.silenceCheckIntervalId);
      this.silenceCheckIntervalId = null;
    }
    this.audioContext?.close().catch(() => {});
    this.audioContext = null;
    this.analyser = null;
    this.silenceStartedAt = null;
  }

  private sendAudio(blob: Blob): void {
    this.isRecording.set(false);
    this.isProcessing.set(true);

    const sourceLanguage = this.sourceLanguage();
    const targetLanguage = this.targetLanguage();
    const url = `/api/one-to-one/translate?source=${sourceLanguage}&target=${targetLanguage}`;

    this.http
      .post<TranslateAudioResponse>(url, blob, {
        headers: { 'Content-Type': blob.type },
      })
      .subscribe({
        next: (response) => {
          this.turns.update((existing) => [
            {
              id: crypto.randomUUID(),
              sourceLanguage,
              targetLanguage,
              transcript: response.transcript,
              translatedText: response.translatedText,
              audioUrl: null,
              isSynthesizing: false,
            },
            ...existing,
          ]);
          const user = this.auth.dbUser();
          if (user) this.auth.dbUser.set({ ...user, turnsBalance: response.turnsBalance });
          this.isProcessing.set(false);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 403 && error.error?.error === 'no_turns_left') {
            const user = this.auth.dbUser();
            if (user) this.auth.dbUser.set({ ...user, turnsBalance: 0 });
            this.errorMessage.set("You're out of translations. Buy a recharge pack to keep going.");
          } else {
            this.errorMessage.set(error.error?.error ?? 'Translation failed. Please try again.');
          }
          this.isProcessing.set(false);
        },
      });
  }

  protected languageLabel(code: string): string {
    return this.languages.find((lang) => lang.code === code)?.label ?? code;
  }

  protected ttsSupported(code: string): boolean {
    return TTS_SUPPORTED_LANGUAGE_CODES.has(code);
  }

  protected playTranslation(turn: Turn): void {
    if (turn.audioUrl) {
      new Audio(turn.audioUrl).play();
      return;
    }

    this.updateTurn(turn.id, { isSynthesizing: true });

    const url = `/api/one-to-one/speak?language=${turn.targetLanguage}`;
    this.http.post(url, { text: turn.translatedText }, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const audioUrl = URL.createObjectURL(blob);
        this.updateTurn(turn.id, { audioUrl, isSynthesizing: false });
        new Audio(audioUrl).play();
      },
      error: () => {
        this.errorMessage.set('Could not generate speech. Please try again.');
        this.updateTurn(turn.id, { isSynthesizing: false });
      },
    });
  }

  private updateTurn(id: string, changes: Partial<Turn>): void {
    this.turns.update((existing) =>
      existing.map((turn) => (turn.id === id ? { ...turn, ...changes } : turn))
    );
  }
}
