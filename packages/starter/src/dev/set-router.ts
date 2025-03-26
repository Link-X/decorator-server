import Koa, { Context } from 'koa';
import Router from '@koa/router';

import { isPromise } from '@decorator-server/decorator';
import SetResponse from './set-response';

export default class SetRouters {
  private setResponse: SetResponse;

  constructor() {
    this.setResponse = new SetResponse();
  }

  /**
   * 根据元数据创建路由
   * @param meta 元数据
   * @param clsObj 类实例
   * @returns 路由实例或 undefined
   */
  public createRouter(
    meta: metaType,
    clsObj: any,
  ): Router<Koa.DefaultState, Koa.DefaultContext> | undefined {
    const { controller = [], router = [] } = meta;
    if (controller.length === 0) {
      return undefined;
    }
    const { prefix = undefined } = controller[0];
    const routerCls = new Router({
      prefix: prefix === '/' ? undefined : prefix,
    });

    router.forEach((routeConfig) => {
      const { route = [] } = routeConfig;
      const pathArr = route.map((r) => r.path);
      const requestMethod =
        route[0].requestMethod.toLocaleLowerCase() as methodNameType;

      routerCls[requestMethod](
        pathArr,
        async (ctx: Context, next: () => Promise<any>) => {
          try {
            await this.routerCallback(ctx, clsObj, routeConfig);
            await next();
          } catch (error) {
            console.error(`路由处理出错: ${error}`);
            ctx.status = 500;
            ctx.body = 'Internal Server Error';
          }
        },
      );
    });

    return routerCls;
  }

  /**
   * 执行路由装饰器的函数
   * @param ctx Koa 上下文
   * @param obj 类实例
   * @param v 路由配置
   */
  private async routerCallback(
    ctx: Context,
    obj: any,
    v: routerType,
  ): Promise<void> {
    const { methodName, response = [] } = v;
    let result;
    const fn = obj[methodName].bind(obj);

    if (isPromise(fn)) {
      result = await fn(ctx);
    } else {
      result = fn(ctx);
    }

    if (isPromise(result)) {
      result = await result;
    }

    this.setResponse.modify(response, ctx);
    if (result) {
      ctx.body = result;
    }
  }
}
