import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly mode = signal<'signIn' | 'signUp'>('signIn');
  readonly email = signal('');
  readonly password = signal('');
  readonly error = signal('');
  readonly loading = signal(false);

  toggleMode(): void {
    this.mode.set(this.mode() === 'signIn' ? 'signUp' : 'signIn');
    this.error.set('');
  }

  async submit(): Promise<void> {
    this.error.set('');
    this.loading.set(true);
    try {
      if (this.mode() === 'signUp') {
        await this.auth.signUpWithEmail(this.email(), this.password());
      } else {
        await this.auth.signInWithEmail(this.email(), this.password());
      }
      this.router.navigateByUrl('/app');
    } catch (err) {
      this.error.set(this.messageFor(err));
    } finally {
      this.loading.set(false);
    }
  }

  async continueWithGoogle(): Promise<void> {
    this.error.set('');
    this.loading.set(true);
    try {
      await this.auth.signInWithGoogle();
      this.router.navigateByUrl('/app');
    } catch (err) {
      this.error.set(this.messageFor(err));
    } finally {
      this.loading.set(false);
    }
  }

  private messageFor(err: unknown): string {
    return err instanceof Error ? err.message : 'Something went wrong. Please try again.';
  }
}
