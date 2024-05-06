import { Provider } from '@nestjs/common';

import { InternalPinoLogger } from '../loggers/internal-pino-logger.service';

const decoratedTokenPrefix = 'PinoLogger:';
const decoratedLoggers = new Set<string>();

export function getPinoLoggerProviders(): Array<Provider<InternalPinoLogger>> {
  return [...decoratedLoggers.values()].map(createDecoratedLoggerProvider);
}

function createDecoratedLoggerProvider(context: string): Provider<InternalPinoLogger> {
  return {
    provide: getLoggerToken(context),
    useFactory: (logger: InternalPinoLogger): InternalPinoLogger => {
      logger.setContext(context);

      return logger;
    },
    inject: [InternalPinoLogger],
  };
}

function getLoggerToken(context: string): string {
  return `${decoratedTokenPrefix}${context}`;
}
