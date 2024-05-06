import redisStore from 'cache-manager-ioredis';

import { Provider } from '@nestjs/common';

export const REDIS_STORE = 'REDIS_STORE';

export const redisStoreProvider: Provider<typeof redisStore> = {
  provide: REDIS_STORE,
  useValue: redisStore,
};
