import pino, { Level } from 'pino';

import { Inject, Injectable, LoggerService } from '@nestjs/common';

import { LOGGER_MODULE_OPTIONS } from '../constants/logger-options-provider-token';
import { ILoggerOptions } from '../interfaces/logger-options.interface';
import { InternalPinoLogger } from './internal-pino-logger.service';

@Injectable()
export class PinoLogger implements LoggerService {
  private readonly contextName: string;

  constructor(
    protected readonly logger: InternalPinoLogger,
    @Inject(LOGGER_MODULE_OPTIONS) options: ILoggerOptions,
  ) {
    const { renameContext } = options;

    this.contextName = renameContext || 'context';
  }

  verbose(message: any, ...optionalParams: any[]): void {
    this.call('trace', message, ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]): void {
    this.call('debug', message, ...optionalParams);
  }

  log(message: any, ...optionalParams: any[]): void {
    this.call('info', message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]): void {
    this.call('warn', message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]): void {
    this.call('error', message, ...optionalParams);
  }

  getInternalLogger(): pino.Logger {
    return this.logger.logger;
  }

  private call(level: Level, message: any, ...optionalParams: any[]): void {
    const objArg: Record<string, any> = {};

    // optionalParams contains extra params passed to logger
    // context name is the last item
    let params: any[] = [];

    if (optionalParams.length !== 0) {
      objArg[this.contextName] = optionalParams.at(-1);

      params = optionalParams.slice(0, -1);
    }

    if (typeof message === 'object') {
      if (message instanceof Error) {
        objArg.err = message;
      } else {
        Object.assign(objArg, message);
      }

      this.logger[level](objArg, ...params);
    } else if (this.isWrongExceptionsHandlerContract(level, message, params)) {
      objArg.err = new Error(message);
      objArg.err.stack = params[0];

      this.logger[level](objArg);
    } else {
      this.logger[level](objArg, message, ...params);
    }
  }

  /**
   * Unfortunately built-in (not only) `^.*Exception(s?)Handler$` classes call `.error`
   * method with not supported contract:
   *
   * - ExceptionsHandler
   * @see https://github.com/nestjs/nest/blob/35baf7a077bb972469097c5fea2f184b7babadfc/packages/core/exceptions/base-exception-filter.ts#L60-L63
   *
   * - ExceptionHandler
   * @see https://github.com/nestjs/nest/blob/99ee3fd99341bcddfa408d1604050a9571b19bc9/packages/core/errors/exception-handler.ts#L9
   *
   * - WsExceptionsHandler
   * @see https://github.com/nestjs/nest/blob/9d0551ff25c5085703bcebfa7ff3b6952869e794/packages/websockets/exceptions/base-ws-exception-filter.ts#L47-L50
   *
   * - RpcExceptionsHandler @see https://github.com/nestjs/nest/blob/9d0551ff25c5085703bcebfa7ff3b6952869e794/packages/microservices/exceptions/base-rpc-exception-filter.ts#L26-L30
   *
   * - all of them
   * @see https://github.com/search?l=TypeScript&q=org%3Anestjs+logger+error+stack&type=Code
   */
  private isWrongExceptionsHandlerContract(
    level: Level,
    message: any,
    params: any[],
  ): params is [string] {
    return (
      level === 'error' &&
      typeof message === 'string' &&
      params.length === 1 &&
      typeof params[0] === 'string' &&
      params[0].includes('at ')
    );
  }
}
