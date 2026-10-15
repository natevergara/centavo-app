import { Router } from 'express';
import { handleTransactionEvent, list, markRead } from '../controllers/notificationController.js';
import { requireSession, resolveUserOrEventContext } from '../middlewares/authMiddleware.js';

export const createNotificationRouter = () => {
  const router = Router();
  const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

  // Endpoint de evento de transacción para evaluación de sobregasto
  router.post('/events/transaction', resolveUserOrEventContext, wrap(handleTransactionEvent));
  router.post('/events/new-transaction', resolveUserOrEventContext, wrap(handleTransactionEvent));

  // Gestión de notificaciones por usuario
  router.get('/', requireSession, wrap(list));
  router.patch('/:id/read', requireSession, wrap(markRead));

  return router;
};
