import { createApp } from './app.js';
import { getConfig } from './config.js';
import { log } from './utils/logger.js';
import { hashPassword } from './modules/hashing.js';
import { createUser, findByEmail } from './repositories/userRepository.js';

const { port } = getConfig();

const seedDefaultUser = async () => {
  const existing = await findByEmail('usuario@centavo.com');
  if (!existing) {
    const passwordHash = await hashPassword('password123');
    await createUser({
      email: 'usuario@centavo.com',
      name: 'Usuario Centavo',
      passwordHash,
    });
    log('info', 'Usuario de desarrollo inicial sembrado');
  }
};

await seedDefaultUser();
createApp().listen(port, () => log('info', 'auth-service escuchando', { port }));
