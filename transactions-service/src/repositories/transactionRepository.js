import { randomUUID } from 'node:crypto';

const transactions = []; // almacén en memoria; reemplazable por BD

export const createTransaction = async ({ userId, amount, category, date, description }) => {
  const record = { id: randomUUID(), userId, amount, category, date, description, createdAt: new Date().toISOString() };
  transactions.push(record);
  return record;
};

// Siempre filtra por userId: cada usuario solo ve sus propias transacciones.
export const findByUser = async (userId, { category, from, to } = {}) =>
  transactions
    .filter((t) => t.userId === userId)
    .filter((t) => !category || t.category === category)
    .filter((t) => !from || t.date >= from)
    .filter((t) => !to || t.date <= to)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

export const toPublicTransaction = ({ id, amount, category, date, description, createdAt }) => ({
  id,
  amount,
  category,
  date,
  description,
  createdAt,
});

export const clearTransactions = () => {
  transactions.length = 0;
};
