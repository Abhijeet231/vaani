import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Reveal } from '../../shared/reveal.directive';
import { AuthService } from '../../core/auth.service';
import { PaymentService } from '../../core/payment.service';

interface RechargePack {
  id: string;
  label: string;
  priceInPaise: number;
  turns: number;
}

@Component({
  selector: 'app-pricing',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressSpinnerModule, Reveal],
  templateUrl: './pricing.html',
  styleUrl: './pricing.scss',
})
export class Pricing implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly payment = inject(PaymentService);

  protected readonly packs = signal<RechargePack[]>([]);
  protected readonly buyingPackId = signal<string | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly successMessage = signal<string | null>(null);

  protected readonly isAuthed = computed(() => this.auth.ready() && !!this.auth.user());

  ngOnInit(): void {
    this.http.get<{ packs: RechargePack[] }>('/api/payments/packs').subscribe({
      next: (response) => this.packs.set(response.packs),
      error: () => this.errorMessage.set('Could not load pricing right now.'),
    });
  }

  protected rupees(priceInPaise: number): string {
    return (priceInPaise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }

  protected async buy(pack: RechargePack): Promise<void> {
    if (!this.isAuthed()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/pricing' } });
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.buyingPackId.set(pack.id);

    try {
      const balance = await this.payment.buyPack(pack.id);
      this.successMessage.set(
        `${pack.label} pack added — you now have ${balance} translations left.`
      );
    } catch (err) {
      this.errorMessage.set(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      this.buyingPackId.set(null);
    }
  }
}
