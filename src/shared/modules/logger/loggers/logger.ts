import pino from 'pino';

import { Logger as NestLogger } from '@nestjs/common';

import { loggerAsyncContext } from '../utils/logger-async-context';

export class Logger extends NestLogger {
  // @ts-expect-error child method has different arguments from the parent
  verbose(message: any, additionalData?: Record<string, any> | Error): void {
    if (additionalData) {
      return super.verbose(additionalData, message);
    }

    super.verbose(message);
  }

  // @ts-expect-error child method has different arguments from the parent
  debug(message: any, additionalData?: Record<string, any> | Error): void {
    if (additionalData) {
      return super.debug(additionalData, message);
    }

    super.debug(message);
  }

  // @ts-expect-error child method has different arguments from the parent
  log(message: any, additionalData?: Record<string, any> | Error): void {
    if (additionalData) {
      return super.log(additionalData, message);
    }

    super.log(message);
  }

  // @ts-expect-error child method has different arguments from the parent
  warn(message: any, error?: Error): void {
    if (error) {
      return super.warn(error, message);
    }

    super.warn(message);
  }

  // @ts-expect-error child method has different arguments from the parent
  error(message: any, error?: Error): void {
    if (error) {
      return super.error(error, message);
    }

    super.error(message);
  }

  static getRequestId(): string | undefined {
    const { reqId } = this.getBindings() ?? {};

    return reqId;
  }

  static getBindings(): pino.Bindings | undefined {
    const pinoLogger = loggerAsyncContext.getStore()?.pinoLogger;

    if (!pinoLogger) {
      return undefined;
    }

    return pinoLogger.bindings();
  }
}
