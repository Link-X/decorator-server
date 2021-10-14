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
  @Get('/page')
  someGetMethod(@Query() id: string) {
    return `hello world${id}`;
  }

  @Post('/api')
  somePostMethod(@Query() params: any) {
    console.log(params)
  }
}
