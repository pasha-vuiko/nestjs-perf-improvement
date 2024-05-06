import { Logger } from 'nestjs-pino';

import { NestFactory } from '@nestjs/core';

import { config } from './app.config';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(Logger);
  app.useLogger(logger);
  app.enableCors();

  await app.listen(config.app.port as string);

  logger.log(`App is running on: ${await app.getUrl()}`, 'main.ts');
}

void bootstrap();
