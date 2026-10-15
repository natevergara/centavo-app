import 'dotenv/config';

export const getConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  const jwtSecret = process.env.JWT_SECRET || (env === 'production' ? '' : 'dev_only_secret');
  if (!jwtSecret) throw new Error('JWT_SECRET es obligatorio en producción');
  return {
    env,
    port: Number(process.env.PORT) || 3001,
    jwtSecret,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  };
};
