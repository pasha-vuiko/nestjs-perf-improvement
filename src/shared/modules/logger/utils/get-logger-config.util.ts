import type { IncomingMessage, ServerResponse } from 'node:http';

import { Request, Response } from 'express';
import pino, { LevelWithSilent } from 'pino';

import { LogFormat } from '../interfaces/logger-options.interface';
import pinoPrettyTransport from './pino-pretty-transport';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getDefaultLoggerConfig(logFormat = LogFormat.JSON) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return {
    stream:
      logFormat === LogFormat.PRETTY
        ? pinoPrettyTransport()
        : pino.destination({ sync: false }),
    customLogLevel: function (
      _req: IncomingMessage,
      res: ServerResponse,
    ): LevelWithSilent {
      const { statusCode } = res;

      if (statusCode >= 400 && statusCode < 500) {
        return 'warn';
      }

      if (statusCode >= 500) {
        return 'error';
      }

      if (statusCode >= 300 && statusCode < 400) {
        return 'info';
      }

      return 'info';
    },
    reqResSerializers: {
      req: (req: Request) => serializeReq(req),
      res: (reply: Response) => serializeRes(reply),
    },
  };
}

function serializeReq(req: Request): any {
  return {
    id: req.id,
    method: req.method,
    url: req.url,
    query: req.query,
    userAgent: req.headers['user-agent'] ?? req.headers['User-Agent'],
  };
}

function serializeRes(res: Response): any {
  return {
    statusCode: res.statusCode,
  };
}
