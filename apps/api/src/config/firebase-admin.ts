import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { Auth, getAuth } from 'firebase-admin/auth';
import { env } from './env';

let auth: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (!auth) {
    if (!env.firebaseProjectId || !env.firebaseClientEmail || !env.firebasePrivateKey) {
      throw new Error(
        'Firebase admin credentials are not set — add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY to apps/api/.env'
      );
    }
    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId: env.firebaseProjectId,
          clientEmail: env.firebaseClientEmail,
          // .env stores the key with literal "\n" sequences — turn them into real newlines.
          privateKey: env.firebasePrivateKey.replace(/\\n/g, '\n'),
        }),
      });
    }
    auth = getAuth();
  }
  return auth;
}
