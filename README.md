使用装饰器启动 http 服务

```javascript
import {
  Get,
  Query,
  Post,
  Controller,
  Provide,
} from '@decorator-server/decorator';

@Provide()
@Controller('/')
export class SomeClass {
  @Get('/page')
  someGetMethod(@Query() id: string) {
    return `hello world${id}`;
  }

  @Post('/api')
  somePostMethod(@Query() params: any) {
    console.log(params)
  }
}
```
