import { Get, Post, Controller, Provide, Inject } from '@decorator-server/decorator';
import type { Context } from 'koa';

@Provide()
export class Rmember {
  sayHello() {
    return 'hello world!'
  }
}

@Provide()
@Controller('/')
export class Server {

  @Inject()
  Rmember: Rmember

  @Get('/hello')
  getFunc() {
    return this.Rmember.sayHello();
    return 'hello world!';
  }

  @Post('/post')
  postFunc(ctx: Context) {
    return { code: 200, success: 'ok', data: ctx.request.body };
  }
}
