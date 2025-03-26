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
import { Context } from 'koa';

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
    this.useTest.aaaa();
    this.sequelize.query();
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
  getNull(params: any) {
    console.log('/null', params);
  }

  @Post('/b')
  @ContentType('json')
  somePostMethod(ctx: Context, a: string, @Query() b: string) {
    console.log(ctx, 'ctx1')
    console.log(a);
    console.log(b);
    ctx.response.body = { a: 2, b: 5 }
    return ctx.response.body;
  }
}
