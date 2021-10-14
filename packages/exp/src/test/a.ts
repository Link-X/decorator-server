import {
  Get,
  Query,
  Post,
  Controller,
  Provide,
} from '@decorator-server/decorator';

@Provide()
@Controller('/')
export class first {
  @Get('/')
  someGetMethod() {
    return `hello world /`;
  }

  @Post('/postUrl')
  somePostMethod(@Query() params: any) {
    console.log(params)
  }
}
