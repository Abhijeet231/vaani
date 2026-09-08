import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../core/auth.service';

// Google is the only sign-in method (2026-09-08). Email/password was removed
// deliberately: every new account is a free grant of Sarvam calls billed to
// us, and throwaway addresses made that trivially farmable — Gmail treats
// user+1@, user+2@ and u.s.e.r@ as one inbox, so even enforced email
// verification wouldn't have stopped one person minting accounts. A Google
// account is much harder to mass-create, and it drops a signup form, a
// password reset flow and email deliverability from the product entirely.
@Component({
  selector: 'app-login',
  imports: [RouterLink, MatButtonModule, MatCardModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly error = signal('');
  readonly loading = signal(false);

  async continueWithGoogle(): Promise<void> {
    this.error.set('');
    this.loading.set(true);
    try {
      await this.auth.signInWithGoogle();
      this.router.navigateByUrl(this.returnUrl());
    } catch (err) {
      this.error.set(this.messageFor(err));
    } finally {
      this.loading.set(false);
    }
  }

  private returnUrl(): string {
    return this.route.snapshot.queryParamMap.get('returnUrl') || '/app';
  }

  private messageFor(err: unknown): string {
    // Closing the Google popup is a normal thing to do, not an error worth
    // showing in red.
    const code = (err as { code?: string })?.code;
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return '';
    }
    return err instanceof Error ? err.message : 'Something went wrong. Please try again.';
  }
}
