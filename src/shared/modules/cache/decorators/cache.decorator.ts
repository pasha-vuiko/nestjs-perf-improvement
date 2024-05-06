import { CacheInterceptor } from '@nestjs/cache-manager';
import { UseInterceptors, applyDecorators } from '@nestjs/common';

/**
 *
 * @description applies caching for a NestJS endpoint
 */
export function Cache(): MethodDecorator {
  return applyDecorators(UseInterceptors(CacheInterceptor));
}
