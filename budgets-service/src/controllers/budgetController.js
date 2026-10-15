import { CATEGORIES, isValidCategory } from '../modules/categories.js';
import { PERIODS, isValidPeriod, normalizePeriod } from '../modules/periods.js';
import { createBudget, findByUser, toPublicBudget } from '../repositories/budgetRepository.js';

export const create = async (req, res) => {
  const body = req.body ?? {};
  const category = body.category ?? body.categoria;
  const rawAmount = body.limitAmount ?? body.amount ?? body.limit ?? body.montoLimite ?? body.monto;
  const rawPeriod = body.period ?? body.periodo;

  if (typeof rawAmount !== 'number' || !Number.isFinite(rawAmount) || rawAmount <= 0) {
    return res.status(400).json({ error: 'El monto límite debe ser un número mayor a 0' });
  }
  if (!isValidCategory(category)) {
    return res.status(400).json({ error: `Categoría inválida. Permitidas: ${CATEGORIES.join(', ')}` });
  }
  if (!isValidPeriod(rawPeriod)) {
    return res.status(400).json({ error: `Período inválido. Permitidos: ${PERIODS.join(', ')}` });
  }

  const period = normalizePeriod(rawPeriod);
  const budget = await createBudget({
    userId: req.user.id,
    category,
    limitAmount: Math.round(rawAmount * 100) / 100,
    period,
  });

  return res.status(201).json({ budget: toPublicBudget(budget) });
};

export const list = async (req, res) => {
  const category = req.query.category ?? req.query.categoria;
  const rawPeriod = req.query.period ?? req.query.periodo;

  if (category !== undefined && !isValidCategory(category)) {
    return res.status(400).json({ error: 'Categoría inválida' });
  }
  if (rawPeriod !== undefined && !isValidPeriod(rawPeriod)) {
    return res.status(400).json({ error: 'Período inválido' });
  }

  const period = rawPeriod ? normalizePeriod(rawPeriod) : undefined;
  const items = await findByUser(req.user.id, { category, period });
  return res.status(200).json({ budgets: items.map(toPublicBudget), total: items.length });
};
