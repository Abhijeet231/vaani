import { Request, Response, NextFunction } from 'express';
import type { SarvamAI } from 'sarvamai';
import { transcribeAudio } from '../services/transcription.service';
import { translateText } from '../services/translation.service';
import { synthesizeSpeech } from '../services/speech.service';
import { spendTurn } from '../models/user.model';
import { createConversation } from '../models/conversation.model';
import { SUPPORTED_LANGUAGE_CODES } from '../config/languages';

// Below this, a detected language is too uncertain to trust over what the
// user actually selected — better to fall back to their choice than
// self-correct on a guess.
const MIN_DETECTION_CONFIDENCE = 0.5;

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

  if (!SUPPORTED_LANGUAGE_CODES.has(sourceLanguageCode) || !SUPPORTED_LANGUAGE_CODES.has(targetLanguageCode)) {
    res.status(400).json({ error: 'Unsupported source/target language' });
    return;
  }

  if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
    res.status(400).json({ error: 'Missing audio body' });
    return;
  }

  try {
    const { transcript, detectedLanguageCode, languageProbability } = await transcribeAudio({
      audio: req.body,
    });

    // Saaras is asked to auto-detect (see transcription.service.ts) so we can
    // check what it actually heard against what the user selected. If it
    // confidently heard a different (and still-supported) language, use that
    // instead of blindly translating from the wrong source — that would
    // otherwise silently produce a garbled result. Detected === target is
    // excluded since "translate X to X" is never useful; trust the user's
    // selection in that case instead.
    let effectiveSourceLanguage: string = sourceLanguageCode;
    let detectedSourceLanguage: string | undefined;
    if (
      detectedLanguageCode &&
      detectedLanguageCode !== sourceLanguageCode &&
      detectedLanguageCode !== targetLanguageCode &&
      SUPPORTED_LANGUAGE_CODES.has(detectedLanguageCode) &&
      (languageProbability ?? 0) >= MIN_DETECTION_CONFIDENCE
    ) {
      effectiveSourceLanguage = detectedLanguageCode;
      detectedSourceLanguage = detectedLanguageCode;
    }

    const translatedText = await translateText({
      text: transcript,
      sourceLanguageCode: effectiveSourceLanguage as unknown as SarvamAI.TranslateSourceLanguage,
      targetLanguageCode,
    });

    // A turn is "you got a translation back" — spend it even if the history
    // save below fails, since the Sarvam call already happened either way.
    let turnsBalance = req.dbUser.turnsBalance - 1;
    try {
      const updated = await spendTurn(req.dbUser.id);
      if (updated) turnsBalance = updated.turnsBalance;
    } catch (usageErr) {
      console.error('Failed to spend turn:', usageErr);
    }

    try {
      await createConversation({
        userId: req.dbUser.id,
        sourceLanguage: effectiveSourceLanguage,
        targetLanguage: targetLanguageCode,
        transcript,
        translatedText,
      });
    } catch (saveErr) {
      console.error('Failed to save conversation history:', saveErr);
    }

    res.status(200).json({ transcript, translatedText, turnsBalance, detectedSourceLanguage });
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
