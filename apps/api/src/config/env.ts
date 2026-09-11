import dotenv from 'dotenv';

dotenv.config();

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  sarvamApi: getRequiredEnv('SARVAM_API_KEY'),

  // Optional at boot — only required once a route that touches the DB or verifies
  // a Firebase token actually runs, so the server can still start without them.
  databaseUrl: process.env.DATABASE_URL,
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
  // Separate from the key secret above: this one is chosen when the webhook is
  // registered in the Razorpay dashboard, and signs the webhook request body.
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,

  // Gmail SMTP, used only by the notify-waitlist script — not by any live route.
  // gmailAppPassword is a 16-char App Password (requires 2FA on the account),
  // not the account's login password.
  gmailUser: process.env.GMAIL_USER,
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD,
};
