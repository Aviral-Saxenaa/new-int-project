import { io } from 'socket.io-client';

export const createSocket = (token, username) =>
  io('/', {
    auth: { token, username },
    transports: ['websocket'],
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });
