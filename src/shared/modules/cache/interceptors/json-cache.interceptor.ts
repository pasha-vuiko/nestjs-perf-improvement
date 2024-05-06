import { FastifyReply } from 'fastify';
import IoRedis from 'ioredis';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { CACHE_KEY_METADATA, CACHE_TTL_METADATA } from '@nestjs/cache-manager';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { isFunction, isNil } from '@nestjs/common/utils/shared.utils';
import { HttpAdapterHost, Reflector } from '@nestjs/core';

import { CacheConfigService } from '../services/config.service';

@Injectable()
export class JsonCacheInterceptor implements NestInterceptor {
  private ioRedisInstance: IoRedis;
  private logger = new Logger(JsonCacheInterceptor.name);

  protected allowedMethods = ['GET'];

  constructor(
    protected readonly reflector: Reflector,
    protected readonly httpAdapterHost: HttpAdapterHost,
  ) {
    this.ioRedisInstance = CacheConfigService.getIoRedisInstance();
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const key = this.getCacheKey(context);
    const ttlValueOrFactory =
      this.reflector.get(CACHE_TTL_METADATA, context.getHandler()) ?? null;

    if (!key) {
      return next.handle();
    }

    try {
      const value = await this.ioRedisInstance.get(key);

      if (!isNil(value)) {
        const reply: FastifyReply | null = context.switchToHttp().getResponse();

        if (reply) {
          reply.header('content-type', 'application/json; charset=utf-8');
        }

        return of(value);
      }

      const ttl = isFunction(ttlValueOrFactory)
        ? await ttlValueOrFactory(context)
        : ttlValueOrFactory;

      return next.handle().pipe(tap(response => void this.setCache(response, key, ttl)));
    } catch {
      return next.handle();
    }
  }

  private getCacheKey(context: ExecutionContext): string | undefined {
    if (!this.isRequestCacheable(context)) {
      return undefined;
    }

    const httpAdapter = this.httpAdapterHost.httpAdapter;
    const isHttpApp = httpAdapter && !!httpAdapter.getRequestMethod;
    const cacheMetadata = this.reflector.get(CACHE_KEY_METADATA, context.getHandler());

    if (!isHttpApp || cacheMetadata) {
      return cacheMetadata;
    }

    const request = context.getArgByIndex(0);

    return httpAdapter.getRequestUrl(request);
  }

  protected isRequestCacheable(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    return this.allowedMethods.includes(req.method);
  }

  private async setCache(responseBody: any, key: string, ttl?: number): Promise<void> {
    const serializedResponseBody = this.serializeResponseBody(responseBody);

    try {
      if (isNil(ttl)) {
        await this.ioRedisInstance.set(key, serializedResponseBody);
        return;
      }

      // @ts-expect-error types are not compatible
      await this.ioRedisInstance.set(key, serializedResponseBody, 'EX', ttl);
    } catch (err) {
      this.logger.error(
        `An error has occurred when inserting "key: ${key}", "value: ${responseBody}"`,
      );
    }
  }

  private serializeResponseBody(response: any): string | number {
    if (typeof response === 'string' || typeof response === 'number') {
      const errMsg = `@${JsonCacheInterceptor.name}() decorator can be used to cache only JSON response bodies, consider to use @UseInterceptors(CacheInterceptor) instead`;

      throw new Error(errMsg);
    }

    try {
      return JSON.stringify(response);
    } catch {
      throw new Error('Failed to stringify response');
    }
  }
}
