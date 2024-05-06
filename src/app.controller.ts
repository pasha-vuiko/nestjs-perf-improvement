import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { JsonCache } from './shared/modules/cache/decorators/json-cache.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @JsonCache()
  @Get('/cached')
  getCachedJson(): Record<string, any> {
    return [
      {
        name: 'John Doe',
        dateOfBirth: '01/01/1970',
        email: 'johndo@email.com',
        address: {
          street: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          zip: '62701',
        },
        roles: ['admin', 'user'],
      },
      {
        name: 'Jane Doe',
        dateOfBirth: '01/01/1970',
        email: 'janedo@email.com',
        address: {
          street: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          zip: '62701',
        },
        roles: ['user'],
      },
    ];
  }
}
