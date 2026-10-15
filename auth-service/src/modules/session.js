import jwt from 'jsonwebtoken';
import { getConfig } from '../config.js';

// Módulo central único: toda emisión/validación de sesión pasa por aquí.

export const createSession = ({ id, email }) => {
  const { jwtSecret, jwtExpiresIn } = getConfig();
  return jwt.sign({ sub: id, email }, jwtSecret, { expiresIn: jwtExpiresIn, algorithm: 'HS256' });
};

export const verifySession = (token) => {
  try {
    const { jwtSecret } = getConfig();
    const payload = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
    return { valid: true, user: { id: payload.sub, email: payload.email } };
  } catch {
    return { valid: false };
  }
};

export const extractBearerToken = (header) => {
  if (typeof header !== 'string') return null;
  const [scheme, token] = header.split(' ');
  return scheme === 'Bearer' && token ? token : null;
};
