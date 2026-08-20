import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';

export function handleOneToOneConnection(ws: WebSocket, req: IncomingMessage) {
  console.log('Client connected:', req.socket.remoteAddress);

  ws.on('message', (data) => {
    console.log('Received:', data.toString());

    // echo back / handle your the protocol here
    ws.send(`Echo: ${data.toString()}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (err) => {
    console.error('Websocket error:', err);
  });

  ws.send(JSON.stringify({ type: 'Welcome', message: 'Connected to WS server' }));
}
