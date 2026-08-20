import { app } from './app';
import { env } from './config/env';
import { createServer } from 'http';
import { WebSocketServer, WebSocket} from "ws"


// wrappng Express app in http servver 
const server = createServer(app)

// attach the websocket server to the same http server
const wss = new WebSocketServer({server})

wss.on('connection', (ws: WebSocket, req) => {
  console.log('Client connected:', req.socket.remoteAddress);

  ws.on('message', (data) => {
    console.log('Received:', data.toString());

    // echo back / handle your the protocol here
    ws.send(`Echo: ${data.toString()}`)
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (err) => {
    console.error('Websocket error:', err)
  });

  ws.send(JSON.stringify({type: 'Welcome', message: 'Connected to WS server'}))

});

server.listen(env.port, () => {
  console.log(`API listening on PORT: ${env.port}`);
  console.log(`Websocket listening on PORT: ${env.port}`)
})
