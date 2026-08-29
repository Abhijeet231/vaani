import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth.service';

interface Purchase {
  id: string;
  packId: string;
  packLabel: string;
  amountInPaise: number;
  turns: number;
  status: 'created' | 'paid' | 'failed';
  createdAt: string;
}

interface PurchasesResponse {
  purchases: Purchase[];
}

@Component({
  selector: 'app-account',
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './account.html',
  styleUrl: './account.scss',
})
export class Account implements OnInit {
  private readonly http = inject(HttpClient);
  protected readonly auth = inject(AuthService);

  protected readonly displayName = computed(() => this.auth.user()?.displayName ?? null);
  protected readonly email = computed(() => this.auth.user()?.email ?? null);
  protected readonly userPhoto = computed(() => this.auth.user()?.photoURL ?? null);
  // Google's photoURL occasionally 429s/fails to load — fall back to the icon, same as app.ts.
  protected readonly photoFailed = signal(false);

  protected readonly purchases = signal<Purchase[]>([]);
  protected readonly isLoadingPurchases = signal(true);
  protected readonly purchaseError = signal<string | null>(null);

  ngOnInit(): void {
    this.http.get<PurchasesResponse>('/api/payments/purchases').subscribe({
      next: (response) => {
        this.purchases.set(response.purchases);
        this.isLoadingPurchases.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.purchaseError.set(error.error?.error ?? 'Could not load purchase history.');
        this.isLoadingPurchases.set(false);
      },
    });
  }

  protected rupees(priceInPaise: number): string {
    return (priceInPaise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }
}
