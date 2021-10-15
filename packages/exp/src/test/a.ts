import {
  Get,
  Provide,
  Controller
} from '@decorator-server/decorator';

@Provide()
@Controller('/')
export class first {
  @Get('/')
  someGetMethod() {
    return `hello world /`;
  }

  somePostMethod(params: any) {
    console.log(params)
  }

  kff = 321

}
