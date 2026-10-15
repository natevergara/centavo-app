import { hashPassword, comparePassword } from '../modules/hashing.js';
import { createSession } from '../modules/session.js';
import { findByEmail, createUser, toPublicUser } from '../repositories/userRepository.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isString = (v) => typeof v === 'string' && v.length > 0;

export const register = async (req, res) => {
  const { email, password, name } = req.body ?? {};
  if (!isString(email) || !EMAIL_RE.test(email)) return res.status(400).json({ error: 'Email inválido' });
  if (!isString(password) || password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }
  if (await findByEmail(email)) return res.status(409).json({ error: 'El email ya está registrado' });

  const user = await createUser({
    email,
    name: isString(name) ? name.trim() : '',
    passwordHash: await hashPassword(password),
  });
  return res.status(201).json({ user: toPublicUser(user), token: createSession(user) });
};

export const login = async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!isString(email) || !isString(password)) return res.status(400).json({ error: 'Credenciales requeridas' });

  const user = await findByEmail(email);
  const ok = user && (await comparePassword(password, user.passwordHash));
  if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });
  return res.status(200).json({ user: toPublicUser(user), token: createSession(user) });
};

export const verify = (req, res) => res.status(200).json({ valid: true, user: req.user });
