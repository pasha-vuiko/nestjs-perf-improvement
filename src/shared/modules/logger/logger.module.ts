import { DynamicModule, Module } from '@nestjs/common';
import { Provider } from '@nestjs/common/interfaces';

import { LOGGER_MODULE_OPTIONS } from './constants/logger-options-provider-token';
import { ILoggerOptions } from './interfaces/logger-options.interface';
import { InternalPinoLogger } from './loggers/internal-pino-logger.service';
import { PinoLogger } from './loggers/pino-logger.service';
import { LoggerConfigService } from './services/logger-config.service';
import { LogLevel } from './types';
import { getDefaultLoggerConfig } from './utils/get-logger-config.util';
import { getPinoLoggerProviders } from './utils/inject-pino-logger';

@Module({})
export class LoggerModule {
  static forRoot(loggerLevel: LogLevel, options?: ILoggerOptions): DynamicModule {
    const optionsWithDefault = this.getOptsMergedWithDefault(loggerLevel, options);

    const paramsProvider: Provider<ILoggerOptions> = {
      provide: LOGGER_MODULE_OPTIONS,
      useValue: optionsWithDefault,
    };

    const decorated = getPinoLoggerProviders();

    return {
      module: LoggerModule,
      providers: [
        PinoLogger,
        ...decorated,
        InternalPinoLogger,
        paramsProvider,
        LoggerConfigService,
      ],
      exports: [PinoLogger, ...decorated, InternalPinoLogger, paramsProvider],
    };
  }

  private static getOptsMergedWithDefault(
    loggerLevel: LogLevel,
    options?: ILoggerOptions,
  ): ILoggerOptions {
    const defaultOptions = getDefaultLoggerConfig(loggerLevel, options?.logFormat);

    if (options) {
      return {
        ...defaultOptions,
        ...options,
      };
    }

    return defaultOptions;
  }
}
