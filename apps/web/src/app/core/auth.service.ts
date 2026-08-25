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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly user = signal<User | null>(null);
  readonly ready = signal(false);

  constructor() {
    onAuthStateChanged(auth, (user) => {
      this.user.set(user);
      this.ready.set(true);
    });
  }

  async signInWithGoogle(): Promise<void> {
    await signInWithPopup(auth, new GoogleAuthProvider());
    await this.syncUser();
  }

  async signUpWithEmail(email: string, password: string): Promise<void> {
    await createUserWithEmailAndPassword(auth, email, password);
    await this.syncUser();
  }

  async signInWithEmail(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(auth, email, password);
    await this.syncUser();
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  }

  getIdToken(): Promise<string | null> {
    return auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null);
  }

  // Upserts the DB row for the just-authenticated user (default plan: trial).
  private async syncUser(): Promise<void> {
    await firstValueFrom(this.http.post('/api/auth/sync', {}));
  }
}
