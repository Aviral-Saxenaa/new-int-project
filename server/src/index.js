import http from 'node:http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { applySchema } from './db/schema.js';
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

const start = async () => {
  try {
    await applySchema();
    console.log('[db] Schema ready');
  } catch (err) {
    console.error('[db] Could not apply schema:', err.message);
  }

  server.listen(env.port, () => {
    console.log(`[server] API running on http://localhost:${env.port}`);
    console.log(`[server] Socket.io listening on ws://localhost:${env.port}`);
  });
};

start();
