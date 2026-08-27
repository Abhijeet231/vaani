import { Router } from 'express';
import { authRouter } from './auth.routes';
import { healthRouter } from './health.routes';
import { historyRouter } from './history.routes';
import { oneToOneRouter } from './oneToOne.routes';

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(oneToOneRouter);
apiRouter.use(authRouter);
apiRouter.use(historyRouter);
