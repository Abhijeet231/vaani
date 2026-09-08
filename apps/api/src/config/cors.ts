import type { CorsOptions } from 'cors';
import { env } from './env';

// Origins allowed to call the API from a browser. Previously this was a bare
// `cors()`, which sends `Access-Control-Allow-Origin: *` — any site could
// drive the API with a stolen or scripted token.
const ALLOWED_ORIGINS = [
  'https://vaani-4a691.web.app',
  'https://vaani-4a691.firebaseapp.com',
  'http://localhost:4200',
];

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    // No Origin header at all means a non-browser caller (curl, a health
    // check, a server-to-server request). CORS exists to protect browser
    // users from other *sites*, not to authenticate callers — that's what
    // requireAuth is for — so these are allowed through.
    if (!origin) {
      callback(null, true);
      return;
    }
    if (ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
      return;
    }
    // In dev, allow any localhost port so a second dev server or a phone on
    // the LAN doesn't need this list edited.
    if (env.nodeEnv !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin not allowed by CORS: ${origin}`));
  },
};
