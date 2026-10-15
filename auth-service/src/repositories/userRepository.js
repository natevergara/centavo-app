import { randomUUID } from 'node:crypto';

const users = new Map(); // email -> registro (almacén en memoria; reemplazable por BD)

const normalize = (email) => email.trim().toLowerCase();

export const findByEmail = async (email) => users.get(normalize(email)) ?? null;

export const createUser = async ({ email, name, passwordHash }) => {
  const record = { id: randomUUID(), email: normalize(email), name, passwordHash };
  users.set(record.email, record);
  return record;
};

export const toPublicUser = ({ id, email, name }) => ({ id, email, name });

export const clearUsers = () => users.clear();
