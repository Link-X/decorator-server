import {
  Get,
  Query,
  Post,
  SetHeader,
  HttpCode,
  ContentType,
  Redirect,
  Controller,
  Provide,
  Inject,
  Init,
} from '@decorator-server/decorator';

import { first } from './utils/a';

@Provide()
export class Test {
  @Init()
  aaaa() {
    console.log('test aaa');
  }
  a = 3;
}

@Provide()
@Controller('/api')
export class SomeClass {
  @Inject()
  useTest: Test;
  @Inject()
  first: first;

  @Inject()
  sequelize;

  @Get('/ccc/:id')
  @SetHeader({ accept: '*/*', test: 'cecece' })
  @ContentType('text')
  @Redirect('/api/redirect')
  async someGetMethod() {
    this.useTest.aaaa()
    this.sequelize.query()
    const awaitFunc = () => {
      return new Promise((res) => {
        setTimeout(() => res('3s -- redirect'), 3000);
      });
    };
    return await awaitFunc();
  }

  @HttpCode(200)
  @Get('/redirect')
  async redirectPath() {
    return 'hello world /redirect';
  }

  @Get('/null')
  getNull() {
    console.log('/null')
  }

  @Post('/b')
  @ContentType('json')
  somePostMethod(@Query() key: string) {
    console.log(key, 'key');
    return { a: 1, b: 3 };
  }
}

