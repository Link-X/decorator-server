import path from 'path';
import Koa, { Context } from 'koa';
import Router from '@koa/router';
import KoaBody from 'koa-body';

import { assemble, isClass, isPromise } from '@decorator-server/decorator';
import { loopDir } from '../utils';

const contentTypes: any = {
  html: 'text/html',
  json: 'application/json',
  text: 'text/plain',
  form: 'multipart/form-data',
};

type methodName = 'get' | 'post' | 'all' | 'head' | 'options';
export class setResponse {
  modify: (response: responseType[], ctx: Context) => void;
  constructor() {
    this.modify = (response: responseType[], ctx: Context) => {
      // @ts-expect-error: TODO
      response.forEach((v) => this[v.type](ctx, v));
    };
  }

  responseContentType(ctx: Context, item: responseType) {
    const type =
      contentTypes[item.contentType] || contentTypes[item.contentType];
    ctx.set('content-type', type);
  }

  responseHttpCode(ctx: Context, item: responseType) {
    ctx.response.status = item.code as number;
  }

  responseHeader(ctx: Context, item: responseType) {
    ctx.set(item.setHeaders);
  }

  responseRedirect(ctx: Context, item: responseType) {
    ctx.response.redirect(item.url as string);
    this.responseHttpCode(ctx, item);
  }
}

class setRouters {
  createRouter: (
    meta: metaType,
    clsObj: any,
  ) => Router<Koa.DefaultState, Koa.DefaultContext> | undefined;
  setResponse: setResponse;
  constructor() {
    this.setResponse = new setResponse();
    this.createRouter = (meta, clsObj: any) => {
      const { controller = [], router = [] } = meta;
      if (!(controller && controller.length)) return;
      const routerCls = new Router({
        prefix: controller[0].prefix || undefined,
      });

      router.forEach((v) => {
        const { route = [] } = v;
        const pathArr = (route || []).map((v) => v.path);

        const requestMethod = route[0].requestMethod.toLocaleLowerCase();
        routerCls[requestMethod as methodName](pathArr, async (ctx: Context, next: any) => {
          await this.routerCallback(ctx, clsObj, v);
          next();
        });
      });
      return routerCls;
    };
  }

  async routerCallback(ctx: Context, obj: any, v: routerType) {
    const { methodName, response = [] } = v;
    let result;
    const fn = obj[methodName];
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

export class Container {
  provideGroup = new Map<string, itemType>();
  app: Koa;
  rootPath = path.resolve(process.cwd(), 'lib');
  setRouters: setRouters;
  constructor(res: setRouters) {
    this.setRouters = res;
    this.init();
  }

  expCls = (pathUrl: string, name: string, isDir: boolean) => {
    if (isDir) return;
    const def = Object.values(require(path.resolve(pathUrl, name)));
    Object.values(def).forEach((v) => {
      if (isClass(v)) {
        this.bind(v);
      }
    });
  };

  bind(cls: any) {
    const meta = assemble(cls);
    if (!meta) return;
    this.provideGroup.set(meta.base.id, { cls: new cls(), meta });
  }

  koaRouterInit(meta: metaType, clsObj: any) {
    const route = this.setRouters.createRouter(meta, clsObj);
    if (!route) return;
    this.app.use(route.routes());
  }

  injectInit(inject: injectType, clsObj: any) {
    if (!inject) return;
    Object.keys(inject).forEach((v) => {
      const item = inject[v][0];
      const providMeta = this.provideGroup.get(item.injectVal) as itemType;
      clsObj[v] = providMeta.cls;
    });
  }

  installKoa() {
    this.app = new Koa();
    this.app.use(KoaBody());
    for (const provideItem of this.provideGroup.values()) {
      this.injectInit(provideItem.meta.inject, provideItem.cls);
      this.koaRouterInit(provideItem.meta, provideItem.cls);
    }
    this.app.listen(9301);
  }

  async init() {
    await loopDir(this.rootPath, this.expCls);
    this.installKoa();
    console.log('http://localhost:9301/');
  }
}

new Container(new setRouters());
