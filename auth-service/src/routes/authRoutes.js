import { Router } from 'express';
import { register, login, verify } from '../controllers/authController.js';
import { requireSession } from '../middlewares/authMiddleware.js';

export const createAuthRouter = () => {
  const router = Router();
  const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
  router.post('/register', wrap(register));
  router.post('/login', wrap(login));
  router.get('/verify', requireSession, verify);
  return router;
};
