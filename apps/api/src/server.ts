import './config/dns-override';
import { app } from './app';
import { env } from './config/env';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { handleOneToOneConnection } from './ws/oneToOne.gateway';

// wrapping Express app in http server
const server = createServer(app);

// attach the websocket server to the same http server
const wss = new WebSocketServer({ server });

wss.on('connection', handleOneToOneConnection);

server.listen(env.port, () => {
  console.log(`API listening on PORT: ${env.port}`);
  console.log(`Websocket listening on PORT: ${env.port}`);
});
