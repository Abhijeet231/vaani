import { IncomingMessage } from 'http';
import { WebSocket, RawData } from 'ws';
import type { SarvamAI } from 'sarvamai';
import { openSaarasStream, SaarasStream } from '../services/transcription.service';
import { translateText } from '../services/translation.service';

function toBuffer(data: RawData): Buffer {
  if (Buffer.isBuffer(data)) {
    return data;
  }
  if (Array.isArray(data)) {
    return Buffer.concat(data);
  }
  return Buffer.from(data);
}

export function handleOneToOneConnection(ws: WebSocket, req: IncomingMessage) {
  console.log('Client connected:', req.socket.remoteAddress);

  const url = new URL(req.url ?? '', 'http://localhost');
  const sourceLanguageCode = url.searchParams.get('source') as SarvamAI.SpeechToTextRealtimeStreamingLanguageCode | null;
  const targetLanguageCode = url.searchParams.get('target') as SarvamAI.TranslateTargetLanguage | null;

  if (!sourceLanguageCode || !targetLanguageCode) {
    ws.send(JSON.stringify({ type: 'error', message: 'Missing source/target language query params' }));
    ws.close();
    return;
  }

  let stream: SaarasStream | undefined;
  const pendingChunks: Buffer[] = [];

  openSaarasStream(sourceLanguageCode, (transcript) => {
    translateText({
      text: transcript,
      sourceLanguageCode: sourceLanguageCode as unknown as SarvamAI.TranslateSourceLanguage,
      targetLanguageCode,
    })
      .then((translatedText) => {
        ws.send(JSON.stringify({ type: 'translation', text: translatedText }));
      })
      .catch((error) => {
        console.error('Translation error:', error);
      });
  })
    .then((openedStream) => {
      stream = openedStream;
      for (const chunk of pendingChunks) {
        stream.sendAudioChunk(chunk.toString('base64'));
      }
      pendingChunks.length = 0;
    })
    .catch((error) => {
      console.error('Failed to open Saaras stream:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Failed to start transcription' }));
      ws.close();
    });

  ws.on('message', (data, isBinary) => {
    if (!isBinary) {
      return;
    }
    const chunk = toBuffer(data);
    if (stream) {
      stream.sendAudioChunk(chunk.toString('base64'));
    } else {
      pendingChunks.push(chunk);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    stream?.close();
  });

  ws.on('error', (err) => {
    console.error('Websocket error:', err);
  });

  ws.send(JSON.stringify({ type: 'Welcome', message: 'Connected to WS server' }));
}
