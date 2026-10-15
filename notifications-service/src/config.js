import 'dotenv/config';

export const getConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  // Debe ser el mismo secreto que usa auth-service para poder validar sus tokens.
  const jwtSecret = process.env.JWT_SECRET || (env === 'production' ? '' : 'dev_only_secret');
  if (!jwtSecret) throw new Error('JWT_SECRET es obligatorio en producción');
  return {
    env,
    port: Number(process.env.PORT) || 3004,
    jwtSecret,
    budgetsServiceUrl: process.env.BUDGETS_SERVICE_URL || 'http://localhost:3003',
    transactionsServiceUrl: process.env.TRANSACTIONS_SERVICE_URL || 'http://localhost:3002',
  };
};
