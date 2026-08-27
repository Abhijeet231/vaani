import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LANGUAGES } from '../one-to-one/languages';

interface HistoryEntry {
  id: string;
  sourceLanguage: string;
  targetLanguage: string;
  transcript: string;
  translatedText: string;
  createdAt: string;
}

interface HistoryResponse {
  history: HistoryEntry[];
}

@Component({
  selector: 'app-history',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History implements OnInit {
  private readonly http = inject(HttpClient);

  protected readonly entries = signal<HistoryEntry[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly deletingId = signal<string | null>(null);

  ngOnInit(): void {
    this.http.get<HistoryResponse>('/api/history').subscribe({
      next: (response) => {
        this.entries.set(response.history);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(error.error?.error ?? 'Could not load history.');
        this.isLoading.set(false);
      },
    });
  }

  protected deleteEntry(id: string): void {
    this.deletingId.set(id);
    this.http.delete(`/api/history/${id}`).subscribe({
      next: () => {
        this.entries.update((existing) => existing.filter((entry) => entry.id !== id));
        this.deletingId.set(null);
      },
      error: () => {
        this.errorMessage.set('Could not delete that entry.');
        this.deletingId.set(null);
      },
    });
  }

  protected languageLabel(code: string): string {
    return LANGUAGES.find((lang) => lang.code === code)?.label ?? code;
  }
}
