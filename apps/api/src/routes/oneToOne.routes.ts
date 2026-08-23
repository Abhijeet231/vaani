import { Router, raw } from 'express';
import { translateAudio, speakText } from '../controllers/oneToOne.controller';

export const oneToOneRouter = Router();

oneToOneRouter.post('/one-to-one/translate', raw({ type: '*/*', limit: '25mb' }), translateAudio);
oneToOneRouter.post('/one-to-one/speak', speakText);
