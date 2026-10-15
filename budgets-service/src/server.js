import { createApp } from './app.js';
import { getConfig } from './config.js';
import { log } from './utils/logger.js';

const { port } = getConfig();
createApp().listen(port, () => log('info', 'budgets-service escuchando', { port }));
