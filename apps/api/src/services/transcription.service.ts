import { sarvamClient } from "../config/sarvam";
import { env } from "../config/env";
import { WebSocket as WS } from "ws";
import type { SarvamAI } from "sarvamai";

export interface SaarasStream {
    sendAudioChunk: (base64Audio: string) => void;
    close: () => void;
}

export interface TranscribeAudioParams {
    audio: Buffer;
}

export interface TranscribeAudioResult {
    transcript: string;
    // The language Saaras actually heard — only meaningful because we always
    // call with language_code "unknown" below, which is what makes it report
    // this back at all (per Sarvam's docs, it's omitted once you pass a
    // specific language_code instead of asking it to detect).
    detectedLanguageCode: string | null;
    languageProbability: number | null;
}

export async function transcribeAudio({ audio }: TranscribeAudioParams): Promise<TranscribeAudioResult> {
    const response = await sarvamClient.speechToText.transcribe({
        file: audio,
        model: "saaras:v3",
        mode: "transcribe",
        language_code: "unknown",
    });

    return {
        transcript: response.transcript,
        detectedLanguageCode: response.language_code ?? null,
        languageProbability: response.language_probability ?? null,
    };
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
        } else if (message.event === "error") {
            console.error("Saaras protocol error:", message.code, message.message);
        }
    });

    socket.on("error", (error) => {
        console.error("Saaras realtime socket error:", error);
    });

    socket.on("close", (event) => {
        console.log("Saaras socket closed:", event.code, event.reason);
    });

    await socket.waitForOpen();

    return {
        sendAudioChunk: (base64Audio) => {
            if (socket.readyState !== WS.OPEN) {
                return;
            }
            socket.sendRealtimeAudioInput({ event: "audio_input", audio: base64Audio });
        },
        close: () => {
            socket.close();
        },
    };
}
