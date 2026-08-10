import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || undefined;

export const createSocket = (token, username) =>
  io(SOCKET_URL, {
    auth: { token, username },
    transports: ['websocket'],
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });
