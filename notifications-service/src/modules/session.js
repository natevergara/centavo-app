import jwt from 'jsonwebtoken';
import { getConfig } from '../config.js';

// Solo verifica tokens emitidos por auth-service (secreto compartido); nunca emite.

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
