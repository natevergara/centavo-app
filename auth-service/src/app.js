import express from 'express';
import cors from 'cors';
import { createAuthRouter } from './routes/authRoutes.js';
import { requestLogger, log } from './utils/logger.js';

export const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.use('/api/auth', createAuthRouter());
  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    log('error', 'unhandled', { message: err.message });
    res.status(500).json({ error: 'Error interno' });
  });
  return app;
};
