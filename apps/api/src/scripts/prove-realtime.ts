import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { handleOneToOneConnection } from "../ws/oneToOne.gateway";

const PORT = 4001;
const CHUNK_MS = 100;
const SAMPLE_RATE = 16000;
const BYTES_PER_SAMPLE = 2; // linear16
const CHUNK_BYTES = (SAMPLE_RATE * BYTES_PER_SAMPLE * CHUNK_MS) / 1000;

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function convertToRawPcm(mp3Path: string, pcmPath: string): void {
    const result = spawnSync("ffmpeg", [
        "-y",
        "-i", mp3Path,
        "-f", "s16le",
        "-ar", String(SAMPLE_RATE),
        "-ac", "1",
        pcmPath,
    ]);

    if (result.status !== 0) {
        throw new Error(`ffmpeg conversion failed: ${result.stderr?.toString()}`);
    }
}

async function proveRealtimePipeline() {
    const audioDir = path.join(__dirname, "../../test-assets");
    const mp3Path = path.join(audioDir, "sarvam demo trimmed.mp3");
    const pcmPath = path.join(audioDir, "sarvam demo trimmed.pcm");

    console.log("Converting mp3 -> raw 16kHz mono PCM via ffmpeg...");
    convertToRawPcm(mp3Path, pcmPath);

    const pcm = fs.readFileSync(pcmPath);
    console.log(`PCM ready: ${pcm.length} bytes (~${(pcm.length / (SAMPLE_RATE * BYTES_PER_SAMPLE)).toFixed(1)}s)`);

    const server = createServer();
    const wss = new WebSocketServer({ server });
    wss.on("connection", handleOneToOneConnection);

    await new Promise<void>((resolve) => server.listen(PORT, resolve));
    console.log(`Test relay server listening on ${PORT}`);

    const client = new WebSocket(`ws://localhost:${PORT}/?source=hi-IN&target=kn-IN`);

    client.on("message", (data) => {
        console.log("Received:", data.toString());
    });

    client.on("error", (err) => {
        console.error("Client socket error:", err);
    });

    await new Promise<void>((resolve, reject) => {
        client.on("open", () => resolve());
        client.on("error", reject);
    });
    console.log("Client connected, streaming audio...");

    for (let offset = 0; offset < pcm.length; offset += CHUNK_BYTES) {
        const chunk = pcm.subarray(offset, offset + CHUNK_BYTES);
        client.send(chunk);
        await sleep(CHUNK_MS);
    }
    console.log("Finished streaming audio, waiting for trailing transcripts...");

    await sleep(5000);

    client.close();
    server.close();
    process.exit(0);
}

proveRealtimePipeline().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
