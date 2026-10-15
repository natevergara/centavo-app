import { CATEGORIES, isValidCategory } from '../modules/categories.js';
import { createTransaction, findByUser, toPublicTransaction } from '../repositories/transactionRepository.js';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Valida formato YYYY-MM-DD y que sea una fecha real (rechaza 2026-02-31).
const isValidDate = (v) => {
  if (typeof v !== 'string' || !DATE_RE.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
};

export const create = async (req, res) => {
  const { amount, category, date, description } = req.body ?? {};
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: 'El monto debe ser un número mayor a 0' });
  }
  if (!isValidCategory(category)) {
    return res.status(400).json({ error: `Categoría inválida. Permitidas: ${CATEGORIES.join(', ')}` });
  }
  if (!isValidDate(date)) return res.status(400).json({ error: 'La fecha debe tener formato YYYY-MM-DD' });
  if (description !== undefined && typeof description !== 'string') {
    return res.status(400).json({ error: 'La descripción debe ser texto' });
  }

  const tx = await createTransaction({
    userId: req.user.id,
    amount: Math.round(amount * 100) / 100,
    category,
    date,
    description: description?.trim() ?? '',
  });
  return res.status(201).json({ transaction: toPublicTransaction(tx) });
};

export const list = async (req, res) => {
  const { category, from, to } = req.query;
  if (category !== undefined && !isValidCategory(category)) {
    return res.status(400).json({ error: 'Categoría inválida' });
  }
  if ((from !== undefined && !isValidDate(from)) || (to !== undefined && !isValidDate(to))) {
    return res.status(400).json({ error: 'Los filtros from/to deben tener formato YYYY-MM-DD' });
  }
  const items = await findByUser(req.user.id, { category, from, to });
  return res.status(200).json({ transactions: items.map(toPublicTransaction), total: items.length });
};
