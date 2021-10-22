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
  Controller,
  Provide,
} from '@decorator-server/decorator';

@Provide()
@Controller('/')
export class SomeClass {
  
  @Get('/page')
  someGetMethod() {
    return `hello world`;
  }
}
```

##### Provide Inject 依赖注入
```javascript
import {
  Post,
  Controller,
  Provide,
} from '@decorator-server/decorator'
// 只要有定义了provide装饰器的class 都允许被
@Provide()
export class Inj {
  abc = 'abc'
  func() {
    //... 
    return this.abc
  }
}

@Provide()
@Controller('/')
export class SomeClass {
  // 注入依赖
  @Inject()
  inj: Inj
  @Post('/page')
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

##### 生命周期
有时候我们可能会需要 在http 启动前的时候或者结束的时候做点什么。  
在src下新建init.ts
../src/init.ts
```javascript
import { LifeCycle, Container } from '@decorator-server/decorator';
import Application from 'koa';
import KoaBody from 'koa-body';

class abc {
  query(a: number) {
    console.log(a, 'abc')
  }
}

export class Init implements LifeCycle {
  async onReady(con: Container, app: Application) {
    app.use(KoaBody())

    // 或者注册全局依赖 (注意只能是class)
    cn.registerObject('sequelize', abc);
  }

  async onStop() {
    console.log('stop');
  }
}
```
