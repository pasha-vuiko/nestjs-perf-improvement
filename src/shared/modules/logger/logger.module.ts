import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { LevelWithSilent } from 'pino';

import { DynamicModule, Module } from '@nestjs/common';

import { LogFormat } from './interfaces/logger-options.interface';
import { getDefaultLoggerConfig } from './utils/get-logger-config.util';

@Module({})
export class LoggerModule {
  static forRoot(
    loggerLevel: LevelWithSilent,
    logFormat = LogFormat.JSON,
  ): DynamicModule {
    const config = getDefaultLoggerConfig(logFormat);

    return {
      module: LoggerModule,
      imports: [
        PinoLoggerModule.forRoot({
          pinoHttp: {
            level: loggerLevel,
            serializers: config.reqResSerializers,
            stream: config.stream,
            customLogLevel: config.customLogLevel,
          },
        }),
      ],
      exports: [PinoLoggerModule],
    };
  }
}
