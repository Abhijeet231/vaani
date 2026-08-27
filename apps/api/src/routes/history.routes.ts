import { Router } from 'express';
import { deleteHistoryEntry, listHistory } from '../controllers/history.controller';
import { requireAuth } from '../middleware/auth.middleware';

export const historyRouter = Router();

historyRouter.get('/history', requireAuth, listHistory);
historyRouter.delete('/history/:id', requireAuth, deleteHistoryEntry);
