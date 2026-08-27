import { Request, Response, NextFunction } from 'express';
import type { SarvamAI } from 'sarvamai';
import { transcribeAudio } from '../services/transcription.service';
import { translateText } from '../services/translation.service';
import { synthesizeSpeech } from '../services/speech.service';
import { incrementUsageCount } from '../models/user.model';
import { createConversation } from '../models/conversation.model';
import { TRIAL_TURN_LIMIT } from '../config/limits';

export async function translateAudio(req: Request, res: Response, next: NextFunction) {
  if (!req.dbUser) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

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

    // A turn is "you got a translation back" — count it even if the history
    // save below fails, since the Sarvam call already happened either way.
    let usageCount = req.dbUser.usageCount + 1;
    try {
      const updated = await incrementUsageCount(req.dbUser.id);
      if (updated) usageCount = updated.usageCount;
    } catch (usageErr) {
      console.error('Failed to increment usage count:', usageErr);
    }

    try {
      await createConversation({
        userId: req.dbUser.id,
        sourceLanguage: sourceLanguageCode,
        targetLanguage: targetLanguageCode,
        transcript,
        translatedText,
      });
    } catch (saveErr) {
      console.error('Failed to save conversation history:', saveErr);
    }

    res.status(200).json({
      transcript,
      translatedText,
      usage: req.dbUser.plan === 'trial' ? { used: usageCount, limit: TRIAL_TURN_LIMIT } : null,
    });
  } catch (err) {
    next(err);
  }
}

export async function speakText(req: Request, res: Response, next: NextFunction) {
  const languageCode = req.query.language as SarvamAI.TextToSpeechLanguage | undefined;
  const text = typeof req.body?.text === 'string' ? req.body.text : undefined;

  if (!languageCode || !text) {
    res.status(400).json({ error: 'Missing language query param or text body' });
    return;
  }

  try {
    const audio = await synthesizeSpeech({ text, languageCode });
    res.status(200).set('Content-Type', 'audio/wav').send(audio);
  } catch (err) {
    next(err);
  }
}
