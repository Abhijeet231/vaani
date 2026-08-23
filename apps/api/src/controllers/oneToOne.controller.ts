import { Request, Response, NextFunction } from 'express';
import type { SarvamAI } from 'sarvamai';
import { transcribeAudio } from '../services/transcription.service';
import { translateText } from '../services/translation.service';

export async function translateAudio(req: Request, res: Response, next: NextFunction) {
  const sourceLanguageCode = req.query.source as SarvamAI.SpeechToTextLanguage | undefined;
  const targetLanguageCode = req.query.target as SarvamAI.TranslateTargetLanguage | undefined;

  if (!sourceLanguageCode || !targetLanguageCode) {
    res.status(400).json({ error: 'Missing source/target language query params' });
    return;
  }

  if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
    res.status(400).json({ error: 'Missing audio body' });
    return;
  }

  try {
    const transcript = await transcribeAudio({ audio: req.body, languageCode: sourceLanguageCode });
    const translatedText = await translateText({
      text: transcript,
      sourceLanguageCode: sourceLanguageCode as unknown as SarvamAI.TranslateSourceLanguage,
      targetLanguageCode,
    });

    res.status(200).json({ transcript, translatedText });
  } catch (err) {
    next(err);
  }
}
