import {
  Get,
  Controller,
  Provide,
} from '@decorator-server/decorator';

@Provide()
@Controller('/')
export class Server {

  @Get('/hello')
  routerFunc() {
    return `hello world!`;
  }
}
