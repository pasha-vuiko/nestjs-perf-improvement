import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';

import { config } from './app.config';
import { AppModule } from './app.module';
import { PinoLogger } from './shared/modules/logger/loggers/pino-logger.service';

async function bootstrap(): Promise<void> {
  const fastifyConfig = await config.app.fastify.getConfig();
  const app = await NestFactory.create(AppModule, new FastifyAdapter(fastifyConfig), {
    bufferLogs: true,
  });

  const logger = app.get(PinoLogger);
  app.useLogger(logger);
  app.enableCors();

  await app.listen(config.app.port as string, '0.0.0.0');

  logger.log(`App is running on: ${await app.getUrl()}`, 'main.ts');
}

void bootstrap();
