import { RedisOptions } from 'ioredis';

import { Provider } from '@nestjs/common';

export const REDIS_MODULE_OPTIONS = Symbol('REDIS_MODULE_OPTIONS');

export function cacheModuleOptionsProvider(
  options: RedisOptions,
): Provider<RedisOptions> {
  return {
    provide: REDIS_MODULE_OPTIONS,
    useValue: options,
  };
}
