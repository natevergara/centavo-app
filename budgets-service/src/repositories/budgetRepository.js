import { randomUUID } from 'node:crypto';

const budgets = []; // almacén en memoria; reemplazable por BD

export const createBudget = async ({ userId, category, limitAmount, period }) => {
  const record = {
    id: randomUUID(),
    userId,
    category,
    limitAmount,
    period,
    createdAt: new Date().toISOString(),
  };
  budgets.push(record);
  return record;
};

// Siempre filtra por userId: cada usuario solo ve sus propios presupuestos.
export const findByUser = async (userId, { category, period } = {}) =>
  budgets
    .filter((b) => b.userId === userId)
    .filter((b) => !category || b.category === category)
    .filter((b) => !period || b.period === period)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));

export const toPublicBudget = ({ id, category, limitAmount, period, createdAt }) => ({
  id,
  category,
  limitAmount,
  period,
  createdAt,
});

export const clearBudgets = () => {
  budgets.length = 0;
};
