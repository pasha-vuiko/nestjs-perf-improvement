import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { Cache } from './shared/modules/cache/decorators/cache.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Cache()
  @Get('/cached')
  getCachedJson(): Record<string, any> {
    return {
      hello: 'world',
    };
  }
}
