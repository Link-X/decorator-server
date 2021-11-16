import Koa, { Context } from 'koa';
import Router from '@koa/router';

import { isPromise } from '@decorator-server/decorator';
import SetResponse from './set-response';

export default class SetRouters {
  public createRouter: (
    meta: metaType,
    clsObj: any,
  ) => Router<Koa.DefaultState, Koa.DefaultContext> | undefined;
  private setResponse: SetResponse;

  constructor() {
    this.setResponse = new SetResponse();
    /** 根据meta创建route */
    this.createRouter = (meta, clsObj: any) => {
      const { controller = [], router = [] } = meta;
      if (!(controller && controller.length)) return;
      const { prefix = undefined } = controller[0];
      const routerCls = new Router({
        prefix: prefix === '/' ? undefined : prefix,
      });
      router.forEach((v) => {
        const { route = [] } = v;
        const pathArr = (route || []).map((v) => v.path);
        const requestMethod =
          route[0].requestMethod.toLocaleLowerCase() as methodNameType;
        routerCls[requestMethod](pathArr, async (ctx: Context, next: any) => {
          await this.routerCallback(ctx, clsObj, v);
          next();
        });
      });
      return routerCls;
    };
  }

  /** 执行router装饰器的函数 */
  private async routerCallback(ctx: Context, obj: any, v: routerType) {
    const { methodName, response = [] } = v;
    let result;
    const fn = obj[methodName].bind(obj);
    if (isPromise(fn)) {
      result = await fn(ctx);
    } else {
      result = fn(ctx);
    }
    if (isPromise(result)) {
      await result;
    }

    this.setResponse.modify(response, ctx);
    if (result) {
      ctx.body = result;
    }
  }
}
