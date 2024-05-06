import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { Logger } from 'pino';

import { ILoggerOptions } from '../interfaces/logger-options.interface';
import { LogLevel } from '../types';
import { LoggerStore, loggerAsyncContext } from '../utils/logger-async-context';

export interface ILoggerPluginOptions extends Omit<ILoggerOptions, 'pinoOptions'> {
  pinoLogger: Logger;
  ignorePaths?: string[];
}

export const loggerPlugin = fastifyPlugin(loggerPluginFn);

async function loggerPluginFn(
  fastify: FastifyInstance,
  options: ILoggerPluginOptions,
): Promise<void> {
  const {
    pinoLogger,
    reqResSerializers,
    customLogLevel = getDefaultResLogLevelFactory(options),
  } = options;

  const {
    req: reqSerializer = defaultReqSerializer,
    res: resSerializer = defaultResSerializer,
  } = reqResSerializers ?? {};

  fastify.addHook('preHandler', (req, __, next) => {
    const loggerStore = new LoggerStore(req.id, pinoLogger);

    loggerAsyncContext.run(loggerStore, next);
  });

  fastify.addHook('onResponse', (req, res) => {
    const serializedReq = reqSerializer(req);
    const serializedRes = resSerializer(res);

    const responseLogLevel = customLogLevel(req, res);

    pinoLogger[responseLogLevel](
      { req: serializedReq, res: serializedRes, responseTime: res.elapsedTime },
      `request completed`,
    );
  });
}

function defaultReqSerializer(req: FastifyRequest): Record<string, any> {
  return {
    method: req.method,
    url: req.url,
    query: req.query,
    userAgent: req.headers['user-agent'] ?? req.headers['User-Agent'],
  };
}

function defaultResSerializer(res: FastifyReply): Record<string, any> {
  return {
    statusCode: res.statusCode,
  };
}

function getDefaultResLogLevelFactory(
  loggerOptions: ILoggerPluginOptions,
): TDefaultLevelPredicate {
  const ignorePaths = new Set(loggerOptions.ignorePaths);

  return (req: FastifyRequest, res: FastifyReply): LogLevel => {
    const { statusCode } = res;

    if (ignorePaths.has(req.url)) {
      return 'silent';
    }

    if (statusCode >= 400 && statusCode < 500) {
      return 'warn';
    }

    if (statusCode >= 500) {
      return 'error';
    }

    return 'debug';
  };
}

type TDefaultLevelPredicate = (req: FastifyRequest, res: FastifyReply) => LogLevel;
