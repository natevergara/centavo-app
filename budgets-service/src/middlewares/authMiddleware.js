import { extractBearerToken, verifySession } from '../modules/session.js';

export const requireSession = (req, res, next) => {
  const token = extractBearerToken(req.headers.authorization);
  const result = token ? verifySession(token) : { valid: false };
  if (!result.valid) return res.status(401).json({ error: 'Sesión inválida o expirada' });
  req.user = result.user;
  return next();
};
