import { Router } from 'express';
import { authRouter } from './auth.routes';
import { healthRouter } from './health.routes';
import { historyRouter } from './history.routes';
import { oneToOneRouter } from './oneToOne.routes';
import { paymentRouter } from './payment.routes';
import { waitlistRouter } from './waitlist.routes';

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(oneToOneRouter);
apiRouter.use(authRouter);
apiRouter.use(historyRouter);
apiRouter.use(paymentRouter);
apiRouter.use(waitlistRouter);
