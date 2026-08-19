import { sarvamClient } from "../config/sarvam";
import type { SarvamAI } from "sarvamai";

export interface TranslateTextParams {
    text: string;
    sourceLanguageCode: SarvamAI.TranslateSourceLanguage;
    targetLanguageCode: SarvamAI.TranslateTargetLanguage;
    numeralsFormat?: "international" | "native";
    mode?: "formal" | "modern-colloquial" | "classic-colloquial" | "code-mixed";
}

export async function translateText({
    text,
    sourceLanguageCode,
    targetLanguageCode,
    numeralsFormat = "native",
    mode = "code-mixed",
}: TranslateTextParams): Promise<string> {
    const response = await sarvamClient.text.translate({
        input: text,
        source_language_code: sourceLanguageCode,
        target_language_code: targetLanguageCode,
        model: "mayura:v1",
        numerals_format: numeralsFormat,
        mode: mode,
    });

    return response.translated_text;
}
