import { extractBearerToken, verifySession } from '../modules/session.js';

export const requireSession = (req, res, next) => {
  const token = extractBearerToken(req.headers.authorization);
  const result = token ? verifySession(token) : { valid: false };
  if (!result.valid) return res.status(401).json({ error: 'Sesión inválida o expirada' });
  req.user = result.user;
  req.token = token;
  return next();
};

export const resolveUserOrEventContext = (req, res, next) => {
  const token = extractBearerToken(req.headers.authorization);
  if (token) {
    const result = verifySession(token);
    if (!result.valid) return res.status(401).json({ error: 'Sesión inválida o expirada' });
    req.user = result.user;
    req.token = token;
    return next();
  }

  const userId = req.body?.userId ?? req.body?.usuarioId;
  if (typeof userId === 'string' && userId.trim()) {
    req.user = { id: userId.trim() };
    req.token = null;
    return next();
  }

  return res.status(401).json({ error: 'Usuario no autenticado o no identificado en el evento' });
};
