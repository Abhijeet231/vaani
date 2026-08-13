import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { apiRouter } from './routes';

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apiRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});
