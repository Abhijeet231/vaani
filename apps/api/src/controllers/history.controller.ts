import { NextFunction, Request, Response } from 'express';
import { findOrCreateUser } from '../models/user.model';
import { deleteConversation, listConversations } from '../models/conversation.model';

export async function listHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const user = await findOrCreateUser({
      firebaseUid: req.user.uid,
      email: req.user.email,
      displayName: req.user.name,
    });
    const history = await listConversations(user.id);
    res.json({ history });
  } catch (err) {
    next(err);
  }
}

export async function deleteHistoryEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const user = await findOrCreateUser({
      firebaseUid: req.user.uid,
      email: req.user.email,
      displayName: req.user.name,
    });
    const deleted = await deleteConversation(req.params.id, user.id);
    if (!deleted) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
