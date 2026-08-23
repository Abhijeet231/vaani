import { Router } from 'express';
import { healthRouter } from './health.routes';
import { oneToOneRouter } from './oneToOne.routes';

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(oneToOneRouter);
