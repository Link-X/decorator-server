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

import { first } from './test/a';

@Provide()
export class Test {
  @Init()
  aaaa() {
    console.log(12344);
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

  @Get('/')
  @Get('/ccc/:id')
  @SetHeader({ accept: '*/*', test: 'cecece' })
  @ContentType('text')
  @Redirect('/api/redirect')
  async someGetMethod() {
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

  @Post('/b')
  @ContentType('json')
  somePostMethod(@Query() key: string) {
    console.log(key);
    return { a: 1, b: 3 };
  }
}

// const provideGroup = new Map();
// console.log(JSON.stringify(assemble(Test, provideGroup)));
// console.log(JSON.stringify(assemble(SomeClass, provideGroup)));
