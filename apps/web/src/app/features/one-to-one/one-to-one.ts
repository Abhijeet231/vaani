import { Component, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LANGUAGES } from './languages';

interface Turn {
  id: string;
  sourceLanguage: string;
  targetLanguage: string;
  transcript: string;
  translatedText: string;
}

interface TranslateAudioResponse {
  transcript: string;
  translatedText: string;
}

@Component({
  selector: 'app-one-to-one',
  imports: [
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

  protected readonly languages = LANGUAGES;
  protected readonly sourceLanguage = signal('hi-IN');
  protected readonly targetLanguage = signal('kn-IN');
  protected readonly isRecording = signal(false);
  protected readonly isProcessing = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly turns = signal<Turn[]>([]);

  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  protected flipDirection(): void {
    const source = this.sourceLanguage();
    this.sourceLanguage.set(this.targetLanguage());
    this.targetLanguage.set(source);
  }

  protected async toggleRecording(): Promise<void> {
    if (this.isRecording()) {
      this.mediaRecorder?.stop();
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
      const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
      const blob = new Blob(this.audioChunks, { type: mimeType });
      this.sendAudio(blob);
    };

    this.mediaRecorder.start();
    this.isRecording.set(true);
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
            },
            ...existing,
          ]);
          this.isProcessing.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage.set(error.error?.error ?? 'Translation failed. Please try again.');
          this.isProcessing.set(false);
        },
      });
  }

  protected languageLabel(code: string): string {
    return this.languages.find((lang) => lang.code === code)?.label ?? code;
  }
}
