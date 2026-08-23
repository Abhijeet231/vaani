import { Router, raw } from 'express';
import { translateAudio } from '../controllers/oneToOne.controller';

export const oneToOneRouter = Router();

oneToOneRouter.post('/one-to-one/translate', raw({ type: '*/*', limit: '25mb' }), translateAudio);
