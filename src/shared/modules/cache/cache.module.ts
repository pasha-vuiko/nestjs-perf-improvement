import { RedisOptions } from 'ioredis';

import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { DynamicModule, Module } from '@nestjs/common';

import { cacheModuleOptionsProvider } from './providers/cache-module-options.provider';
import { redisStoreProvider } from './providers/redis-store.provider';
import { CacheConfigService } from './services/config.service';

@Module({
  exports: [NestCacheModule, CacheConfigService],
})
export class CacheModule {
  static forRoot(opts: RedisOptions = {}): DynamicModule {
    const filteredOptions = filterModuleOptions(opts);

    return {
      module: CacheModule,
      global: true,
      imports: [
        NestCacheModule.registerAsync({
          useClass: CacheConfigService,
          extraProviders: [
            redisStoreProvider,
            cacheModuleOptionsProvider(filteredOptions),
          ],
        }),
      ],
      providers: [
        redisStoreProvider,
        cacheModuleOptionsProvider(opts),
        CacheConfigService,
      ],
    };
  }
}

function filterModuleOptions(options: RedisOptions): RedisOptions {
  const resultConfig = {};

  for (const key of Object.getOwnPropertyNames(options)) {
    // @ts-expect-error - we are sure that key exists in options
    if (options[key] !== undefined) {
      // @ts-expect-error - we are sure that key exists in options
      resultConfig[key] = options[key];
    }
  }

  return resultConfig;
}
