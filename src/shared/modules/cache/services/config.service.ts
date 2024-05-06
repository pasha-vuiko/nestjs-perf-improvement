import IoRedis, { RedisOptions } from 'ioredis';

import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { CacheStoreFactory } from '@nestjs/common/cache/interfaces/cache-manager.interface';

import { REDIS_MODULE_OPTIONS } from '../providers/cache-module-options.provider';
import { REDIS_STORE } from '../providers/redis-store.provider';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory, OnApplicationShutdown {
  private static moduleOptions: RedisOptions;
  private static ioRedisInstance: IoRedis;
  private static logger = new Logger('RedisConfigService');

  constructor(
    @Inject(REDIS_STORE)
    private redisStore: CacheStoreFactory,
    @Inject(REDIS_MODULE_OPTIONS)
    private moduleOptions: RedisOptions,
  ) {
    CacheConfigService.moduleOptions = moduleOptions;
  }

  onApplicationShutdown(): void {
    CacheConfigService.getIoRedisInstance().disconnect();
    CacheConfigService.logger.log('Successfully disconnected from the Redis');
  }

  public createCacheOptions(): CacheModuleOptions {
    return {
      store: this.redisStore,
      redisInstance: CacheConfigService.getIoRedisInstance(),
    };
  }

  public static getIoRedisInstance(): IoRedis {
    if (this.ioRedisInstance) {
      return this.ioRedisInstance;
    }

    this.ioRedisInstance = new IoRedis(this.moduleOptions);

    this.listenToRedisConnection(this.ioRedisInstance);
    this.listenToRedisError(this.ioRedisInstance);

    return this.ioRedisInstance;
  }

  private static listenToRedisError(redisClient: IoRedis): void {
    redisClient.on('error', err => {
      this.logger.error(`Redis error: ${err.message}`);
    });
  }

  private static listenToRedisConnection(redisClient: IoRedis): void {
    redisClient.on('connect', () => {
      this.logger.log(`Successfully connected to the Redis`);
    });
  }
}
