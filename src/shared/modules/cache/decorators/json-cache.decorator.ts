import { UseInterceptors } from '@nestjs/common';

import { JsonCacheInterceptor } from '../interceptors/json-cache.interceptor';

/**
 *
 * @description Caches response of GET endpoint, may be used for endpoints that return
 * JSON only, as it always adds "content-type: application/json" header to the cached response
 */
export function JsonCache(): MethodDecorator {
  return UseInterceptors(JsonCacheInterceptor);
}
