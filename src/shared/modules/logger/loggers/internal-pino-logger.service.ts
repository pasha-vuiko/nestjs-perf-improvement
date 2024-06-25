import pino from 'pino';

import { Inject, Injectable, Scope } from '@nestjs/common';

import { LOGGER_MODULE_OPTIONS } from '../constants/logger-options-provider-token';
import { ILoggerOptions } from '../interfaces/logger-options.interface';
import { loggerAsyncContext } from '../utils/logger-async-context';

type PinoMethods = Pick<
  pino.Logger,
  'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
>;

/**
 * This is copy of pino.LogFn but with possibilty to make method override.
 * Current usage works:
 *
 *  trace(msg: string, ...args: any[]): void;
 *  trace(obj: object, msg?: string, ...args: any[]): void;
 *  trace(...args: Parameters<LoggerFn>) {
 *    this.call('trace', ...args);
 *  }
 *
 * But if change local LoggerFn to pino.LogFn – this will say that overrides
 * are incompatible
 */
type LoggerFn =
  | ((msg: string, ...args: any[]) => void)
  | ((obj: object, msg?: string, ...args: any[]) => void);

let outOfContextLogger: pino.Logger | undefined;

@Injectable({ scope: Scope.TRANSIENT })
export class InternalPinoLogger implements PinoMethods {
  protected context = '';
  protected readonly contextName: string;

  constructor(@Inject(LOGGER_MODULE_OPTIONS) options: ILoggerOptions) {
    const { pinoOptions, stream, renameContext } = options;

    if (!outOfContextLogger) {
      if (stream && pinoOptions) {
        outOfContextLogger = pino(pinoOptions, stream);
      } else {
        outOfContextLogger = pino(pinoOptions);
      }
    }

    this.contextName = renameContext || 'context';
  }

  trace(msg: string, ...args: any[]): void;
  trace(obj: unknown, msg?: string, ...args: any[]): void;
  trace(...args: Parameters<LoggerFn>): void {
    this.call('trace', args);
  }

  debug(msg: string, ...args: any[]): void;
  debug(obj: unknown, msg?: string, ...args: any[]): void;
  debug(...args: Parameters<LoggerFn>): void {
    this.call('debug', args);
  }

  info(msg: string, ...args: any[]): void;
  info(obj: unknown, msg?: string, ...args: any[]): void;
  info(...args: Parameters<LoggerFn>): void {
    this.call('info', args);
  }

  warn(msg: string, ...args: any[]): void;
  warn(obj: unknown, msg?: string, ...args: any[]): void;
  warn(...args: Parameters<LoggerFn>): void {
    this.call('warn', args);
  }

  error(msg: string, ...args: any[]): void;
  error(obj: unknown, msg?: string, ...args: any[]): void;
  error(...args: Parameters<LoggerFn>): void {
    this.call('error', args);
  }

  fatal(msg: string, ...args: any[]): void;
  fatal(obj: unknown, msg?: string, ...args: any[]): void;
  fatal(...args: Parameters<LoggerFn>): void {
    this.call('fatal', args);
  }

  setContext(value: string): void {
    this.context = value;
  }

  protected call(method: pino.Level, args: Parameters<LoggerFn>): void {
    // @ts-expect-error args are union of tuple types
    this.logger[method](...args);
  }

  public get logger(): pino.Logger {
    // outOfContext is always set in runtime before starts using

    const store = loggerAsyncContext.getStore();

    if (!store) {
      // @ts-expect-error logger is not defined
      return outOfContextLogger;
    }

    return store.pinoLogger;
  }

  public assign(fields: pino.Bindings): void {
    const store = loggerAsyncContext.getStore();

    if (!store) {
      throw new Error(
        `${InternalPinoLogger.name}: unable to assign extra fields out of request scope`,
      );
    }

    store.pinoLogger = store.pinoLogger.child(fields);
  }
}
