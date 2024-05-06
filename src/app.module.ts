import { LevelWithSilent } from 'pino';

import { Module } from '@nestjs/common';

import { config } from './app.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheModule } from './shared/modules/cache/cache.module';
import { LoggerModule } from './shared/modules/logger/logger.module';

@Module({
  imports: [
    LoggerModule.forRoot(config.app.logger.level as LevelWithSilent),
    CacheModule.forRoot({
      host: config.cache.redis.host,
      port: config.cache.redis.port,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
