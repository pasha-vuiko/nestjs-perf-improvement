import { AsyncLocalStorage } from 'node:async_hooks';

import pino from 'pino';

export class LoggerStore {
  constructor(
    public reqId: string,
    public pinoLogger: pino.Logger,
  ) {}
}

export const loggerAsyncContext = new AsyncLocalStorage<LoggerStore>();
