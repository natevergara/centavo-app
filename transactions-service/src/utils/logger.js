const SENSITIVE = /pass|token|secret|authorization|hash/i;

export const sanitize = (value) => {
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, SENSITIVE.test(k) ? '[REDACTED]' : sanitize(v)])
    );
  }
  return value;
};

export const log = (level, message, meta = {}) => {
  console.log(JSON.stringify({ level, message, ...sanitize(meta), ts: new Date().toISOString() }));
};

export const requestLogger = (req, _res, next) => {
  log('info', 'request', { method: req.method, path: req.path, body: req.body, headers: req.headers });
  next();
};
