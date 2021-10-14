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

@Provide()
export class Test {
  @Init()
  aaaa() {
    console.log(12344);
  }
  a = 3
}

@Provide()
@Controller('/api')
export class SomeClass {
  @Inject()
  useTest: Test;
  @Inject()
  usetTest2: Test;

  @Get('/')
  @Get('/main')
  @Get('/ccc')
  @SetHeader({ accept: '*/*' })
  @HttpCode(301)
  @ContentType('json')
  @Redirect('/ccc')
  someGetMethod() {
    console.log(this.useTest.a, '----');
    return 'hello world api/main';
  }

  @Post('/b')
  somePostMethod(@Query() key: string) {
    console.log(key);
  }
}

// const provideGroup = new Map();
// console.log(JSON.stringify(assemble(Test, provideGroup)));
// console.log(JSON.stringify(assemble(SomeClass, provideGroup)));
