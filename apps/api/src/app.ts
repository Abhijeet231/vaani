import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { apiRouter } from './routes';
import { corsOptions } from './config/cors';
import { globalLimiter } from './middleware/rate-limit.middleware';

export const app = express();

// Render terminates TLS at its proxy, so without this every request looks like
// it comes from the same proxy address and the per-IP limiters below would
// throttle the entire internet as one client. The 1 is the number of proxies
// in front of us — don't set it to `true`, which trusts any X-Forwarded-For a
// caller cares to send and lets them spoof their way past the limiter.
app.set('trust proxy', 1);

app.use(cors(corsOptions));

// Razorpay signs the exact bytes it POSTs to the webhook, so that one route
// needs the untouched body — express.json() would parse it away and a
// re-serialised object would not reproduce the signed byte sequence. This is a
// body parser scoped to one path, not a route: the router itself still lives in
// routes/index.ts. It must come first, because whichever parser runs first
// consumes the stream and body-parser skips a request another has handled.
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.use('/api', globalLimiter);
app.use('/api', apiRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  // A blocked origin is a caller problem, not a server fault — a 500 here
  // would be misleading in logs and in the browser.
  if (err.message?.startsWith('Origin not allowed by CORS')) {
    res.status(403).json({ error: 'Origin not allowed' });
    return;
  }
  res.status(500).json({ error: 'Internal server error' });
});
