import { sarvamClient } from "../config/sarvam";
import type { SarvamAI } from "sarvamai";

export interface SynthesizeSpeechParams {
    text: string;
    languageCode: SarvamAI.TextToSpeechLanguage;
}

export async function synthesizeSpeech({ text, languageCode }: SynthesizeSpeechParams): Promise<Buffer> {
    const response = await sarvamClient.textToSpeech.convert({
        text,
        language_code: languageCode,
        model: "bulbul:v3",
    });

    return Buffer.from(response.audios[0], "base64");
}
