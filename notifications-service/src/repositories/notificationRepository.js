import { randomUUID } from 'node:crypto';

const notifications = []; // almacén en memoria; reemplazable por BD

export const createNotification = async ({
  userId,
  type = 'OVERSPENDING_ALERT',
  category,
  amount,
  budgetLimit,
  totalSpent,
  overspentAmount,
  percentage,
  message,
  severity = 'warning',
  date,
  metadata = {},
}) => {
  const record = {
    id: randomUUID(),
    userId,
    type,
    category,
    amount,
    budgetLimit,
    totalSpent,
    overspentAmount,
    percentage,
    message,
    severity,
    read: false,
    date: date || new Date().toISOString().slice(0, 10),
    metadata,
    createdAt: new Date().toISOString(),
  };
  notifications.push(record);
  return record;
};

export const findByUser = async (userId, { read, type } = {}) =>
  notifications
    .filter((n) => n.userId === userId)
    .filter((n) => (read === undefined ? true : n.read === (read === 'true' || read === true)))
    .filter((n) => (!type ? true : n.type === type))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));

export const findById = async (id) => notifications.find((n) => n.id === id) || null;

export const markAsRead = async (id, userId) => {
  const item = notifications.find((n) => n.id === id && n.userId === userId);
  if (!item) return null;
  item.read = true;
  item.readAt = new Date().toISOString();
  return item;
};

export const toPublicNotification = ({
  id,
  type,
  category,
  amount,
  budgetLimit,
  totalSpent,
  overspentAmount,
  percentage,
  message,
  severity,
  read,
  readAt,
  date,
  createdAt,
}) => ({
  id,
  type,
  category,
  amount,
  budgetLimit,
  totalSpent,
  overspentAmount,
  percentage,
  message,
  severity,
  read,
  readAt,
  date,
  createdAt,
});

export const clearNotifications = () => {
  notifications.length = 0;
};
