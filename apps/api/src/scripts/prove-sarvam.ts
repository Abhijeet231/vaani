import { sarvamClient } from "../config/sarvam";
import { translateText } from "../services/translation.service";
import fs from "fs";
import path from "path";

async function proveSarvamPipeline() {
    const audioPath = path.join(__dirname, "../../test-assets/sarvam demo trimmed.mp3");
    const audioFile = fs.createReadStream(audioPath);

    try {
        // Speech-to-text
        const response = await sarvamClient.speechToText.transcribe({
            file: audioFile,
            model: "saaras:v3",
            mode: "transcribe"
        });

        const hindiText = response.transcript;

        console.log("Transcript:", response.transcript)

        // Translating the trnascript with Mayura
        const translatedText = await translateText({
            text: hindiText,
            sourceLanguageCode: "hi-IN",
            targetLanguageCode: "kn-IN",
        });

        console.log("Translated:", translatedText);
    } catch (error) {
        console.error("Error:", error)
    }
}

proveSarvamPipeline();

