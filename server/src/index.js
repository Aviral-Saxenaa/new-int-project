import http from 'node:http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { setupSocket } from './socket/index.js';

const app = createApp();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.clientUrl,
    methods: ['GET', 'POST'],
  },
});

setupSocket(io);

server.listen(env.port, () => {
  console.log(`[server] API running on http://localhost:${env.port}`);
  console.log(`[server] Socket.io listening on ws://localhost:${env.port}`);
});
