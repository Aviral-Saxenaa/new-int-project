import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import messageRoutes from './routes/messages.routes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: env.clientUrl,
      methods: ['GET', 'POST', 'PATCH'],
    })
  );
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ success: true, status: 'ok', time: new Date().toISOString() });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/messages', messageRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
