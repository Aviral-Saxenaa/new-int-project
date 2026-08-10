import { createMessage, markAsRead } from '../services/message.service.js';
import { getUserByToken } from '../services/auth.service.js';
import { ApiError } from '../middleware/errorHandler.js';

const onlineUsers = new Map();
const typingUsers = new Map();

const broadcastOnlineUsers = (io) => {
  const users = [...onlineUsers.values()];
  io.emit('users:online', users);
};

const broadcastTypingUsers = (io) => {
  io.emit('typing:users', [...typingUsers.keys()]);
};

const sendTyping = (io, socketId) => {
  setTimeout(() => {
    if (typingUsers.has(socketId)) {
      typingUsers.delete(socketId);
      broadcastTypingUsers(io);
    }
  }, 3000);
};

export const setupSocket = (io) => {
  io.on('connection', (socket) => {
    const { token, username } = socket.handshake.auth || {};

    const session = token ? getUserByToken(token) : null;
    if (!session || session.username !== username) {
      socket.emit('error', { message: 'Authentication failed' });
      socket.disconnect(true);
      return;
    }

    const user = { userId: session.userId, username: session.username, socketId: socket.id };
    onlineUsers.set(socket.id, user);
    socket.join('general');
    socket.emit('users:online', [...onlineUsers.values()]);
    socket.broadcast.emit('users:online', [...onlineUsers.values()]);

    socket.on('message:send', async (payload) => {
      try {
        const message = await createMessage({
          userId: user.userId,
          username: user.username,
          content: payload?.content,
        });

        socket.emit('message:ack', { tempId: payload?.tempId, message });
        socket.broadcast.to('general').emit('message:new', message);
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Failed to send message';
        socket.emit('error', { message, tempId: payload?.tempId });
      }
    });

    socket.on('message:read', async (payload) => {
      try {
        if (!payload?.messageId) return;
        await markAsRead(payload.messageId);
        io.to('general').emit('message:status', {
          id: payload.messageId,
          status: 'read',
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to update message status' });
      }
    });

    socket.on('typing:start', () => {
      typingUsers.set(socket.id, user.username);
      broadcastTypingUsers(io);
      sendTyping(io, socket.id);
    });

    socket.on('typing:stop', () => {
      if (typingUsers.delete(socket.id)) {
        broadcastTypingUsers(io);
      }
    });

    socket.on('disconnect', () => {
      typingUsers.delete(socket.id);
      onlineUsers.delete(socket.id);
      broadcastOnlineUsers(io);
      broadcastTypingUsers(io);
    });
  });
};
