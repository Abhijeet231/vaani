import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  Auth,
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { firstValueFrom } from 'rxjs';
import { firebaseConfig } from './firebase.config';

const firebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(firebaseApp);

export interface DbUser {
  plan: 'trial' | 'paid' | 'expired';
  usageCount: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly user = signal<User | null>(null);
  readonly ready = signal(false);
  // Mirrors the Neon `users` row (plan/usageCount) — set on every sync, and
  // updateable straight from a translate response so we don't need a second
  // round trip just to refresh the count after a turn.
  readonly dbUser = signal<DbUser | null>(null);

  constructor() {
    onAuthStateChanged(auth, (user) => {
      this.user.set(user);
      this.ready.set(true);
      // Runs on every real sign-in AND on session restore (page reload with an
      // existing session) — not just the explicit sign-in/sign-up calls below —
      // so a DB row gets (re)created whenever we see an authenticated user, and
      // a sync failure never blocks or errors the login flow itself (Firebase
      // auth already succeeded by this point; the DB row is best-effort).
      if (user) {
        this.syncUser().catch((err) => console.error('Failed to sync user with backend:', err));
      }
    });
  }

  async signInWithGoogle(): Promise<void> {
    await signInWithPopup(auth, new GoogleAuthProvider());
  }

  async signUpWithEmail(email: string, password: string): Promise<void> {
    await createUserWithEmailAndPassword(auth, email, password);
  }

  async signInWithEmail(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  getIdToken(): Promise<string | null> {
    return auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null);
  }

  // Upserts the DB row for the just-authenticated user (default plan: trial).
  private async syncUser(): Promise<void> {
    const response = await firstValueFrom(this.http.post<{ user: DbUser }>('/api/auth/sync', {}));
    this.dbUser.set(response.user);
  }
}
