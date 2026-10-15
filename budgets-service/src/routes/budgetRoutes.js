import { Router } from 'express';
import { create, list } from '../controllers/budgetController.js';
import { requireSession } from '../middlewares/authMiddleware.js';

export const createBudgetRouter = () => {
  const router = Router();
  const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
  router.use(requireSession);
  router.post('/', wrap(create));
  router.get('/', wrap(list));
  return router;
};
