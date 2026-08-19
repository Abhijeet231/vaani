import { sarvamClient } from "../config/sarvam";
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
        const translateResponse = await sarvamClient.text.translate({
            input: hindiText,
            source_language_code: "hi-IN",
            target_language_code: "kn-IN",
            model: "mayura:v1",
            numerals_format: "native",
            mode: "code-mixed"
        })

        console.log("Translated:", translateResponse.translated_text);
    } catch (error) {
        console.error("Error:", error)
    }
}

proveSarvamPipeline();

