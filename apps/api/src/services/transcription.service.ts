import { sarvamClient } from "../config/sarvam";
import { env } from "../config/env";
import type { SarvamAI } from "sarvamai";

export interface SaarasStream {
    sendAudioChunk: (base64Audio: string) => void;
    close: () => void;
}

export async function openSaarasStream(
    languageCode: SarvamAI.SpeechToTextRealtimeStreamingLanguageCode,
    onFinalTranscript: (text: string) => void
): Promise<SaarasStream> {
    const socket = await sarvamClient.speechToTextRealtimeStreaming.connect({
        language_code: languageCode,
        model: "saaras:v3-realtime",
        "Api-Subscription-Key": env.sarvamApi,
    });

    socket.on("message", (message) => {
        if (message.event === "transcript.final") {
            onFinalTranscript(message.text);
        }
    });

    socket.on("error", (error) => {
        console.error("Saaras realtime socket error:", error);
    });

    await socket.waitForOpen();

    return {
        sendAudioChunk: (base64Audio) => {
            socket.sendRealtimeAudioInput({ event: "audio_input", audio: base64Audio });
        },
        close: () => {
            socket.close();
        },
    };
}
