import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { UseInterceptors, applyDecorators } from '@nestjs/common';

/**
 *
 * @param ttl cache ttl in seconds
 * @description applies caching for a NestJS endpoint
 */
export function Cache(): MethodDecorator {
  return applyDecorators(UseInterceptors(CacheInterceptor));
}
