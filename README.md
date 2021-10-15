使用装饰器启动 http 服务
#### 启动示例
`git clone https://github.com/Link-X/decorator-server.git`  
`cd decorator-server`  

`yarn install`  
`yarn build`  

`cd packages/exp`  
`yarn dev`  

访问：http://localhost:9301/api  

##### base
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

##### Inject
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
  someGetMethod() {
    return `hello world${this.inj.func()}`;
  }
}
```

##### Redirect
```javascript
... 
@Provide()
@Controller('/test')
export class SomeClass {
  @Get('/page')
  @Redirect('/test/abc')
  someGetMethod() {
    this.inj.func()
    return `hello world${id}`;
  }

  @Get('/abc)
  async someGetMethod2()   {
    const awaitFunc = () => {
      return new Promise(res => {
        setTimeout(() => res('3s -- redirect'), 3000)
      })
    }
    return await awaitFunc()
  }
}
```
