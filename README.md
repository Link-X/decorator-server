使用装饰器启动 http 服务
#### 启动示例
`git clone https://github.com/Link-X/decorator-server.git`  
`cd decorator-server`  

`yarn install`  
`yarn build`  

`cd packages/exp`  
`yarn dev`  

访问：http://localhost:9301  

##### base 基础示例
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

##### Provide Inject 依赖注入
```javascript
...

@Provide()
export class Inj {
  abc = 'abc'
  func() {
    return this.abc
  }
}

@Provide()
@Controller('/')
export class SomeClass {
  @Inject()
  inj: Inj
  @Get('/page')
  someGetMethod(ctx) {
    console.lgo(ctx)
    return `hello world${this.inj.func()}`;
  }
}
```

##### Redirect 重定向
```javascript
... 
@Provide()
@Controller('/test')
export class SomeClass {
  @Get('/page')
  @Redirect('/test/abc')
  async someGetMethod() {
     const awaitFunc = () => {
      return new Promise(res => {
        setTimeout(() => res('3s -- redirect'), 3000)
      })
    }
    return await awaitFunc()
  }

  @Get('/abc)
  someGetMethod2()   {
    return `hello world /abc`
  }
}
```
