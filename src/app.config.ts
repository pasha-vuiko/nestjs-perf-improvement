import path from 'node:path';

import { checkEnvVarsSet } from './shared/utils/check-env-vars-set';

checkEnvVarsSet(path.resolve(__dirname, '../.env.example'));
setUtcTimezone();

export const config = {
  app: {
    port: process.env.PORT,
    version: process.env.APP_VERSION,
    mode: process.env.NODE_ENV,
    isDevelopment: process.env.NODE_ENV === 'development',
    logger: {
      level: process.env.LOGGER_LEVEL,
      prettyPrint: process.env.LOG_FORMAT === 'pretty',
    },
  },
  cache: {
    redis: {
      host: process.env.REDIS_CONFIG_HOST,
      port: Number(process.env.REDIS_CONFIG_PORT),
    },
  },
} as const;

function setUtcTimezone(): void {
  process.env.TZ = 'UTC';
}
