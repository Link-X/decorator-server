import path from 'path';
import Koa from 'koa';
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

export class setResponse {
  [string: string]: (ctx: ctxType, item: responseType) => void;

  responseContentType(ctx: ctxType, item: responseType) {
    const type =
      contentTypes[item.contentType] || contentTypes[item.contentType];
    ctx.set('content-type', type);
  }

  responseHttpCode(ctx: ctxType, item: responseType) {
    ctx.response.status = item.code;
  }

  responseHeader(ctx: ctxType, item: responseType) {
    ctx.set(item.setHeaders);
  }

  responseRedirect(ctx: ctxType, item: responseType) {
    ctx.response.redirect(item.url);
    this.responseHttpCode(ctx, item);
  }
}

export class Container {
  provideGroup = new Map<string, itemType>();
  app: Koa;
  rootPath = path.resolve(process.cwd(), 'lib');
  resCls: setResponse;
  constructor(res: setResponse) {
    this.resCls = res;
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

  async routerCallback(ctx: ctxType, obj: any, v: routerType) {
    const { methodName, response = [] } = v;
    let rv;
    if (isPromise(obj[methodName])) {
      rv = await obj[methodName](ctx);
    } else {
      rv = obj[methodName](ctx);
    }
    response.forEach((v) => this.resCls[v.type](ctx, v));
    if (rv) {
      ctx.body = rv;
    }
  }

  koaRouterInit(meta: metaType, clsObj: any) {
    const { controller = [], router = [] } = meta;
    if (!(controller && controller.length)) return;
    const routerCls = new Router({
      prefix: controller[0].prefix || undefined,
    });
    router.forEach((v) => {
      const { route = [] } = v;
      const pathArr = (route || []).map((v) => v.path);

      const routerFunc = async (ctx: ctxType, next: any) => {
        await this.routerCallback(ctx, clsObj, v);
        next();
      };

      const { requestMethod } = route[0];
      if (requestMethod === 'GET') {
        routerCls.get(pathArr, (ctx, next) => routerFunc(ctx, next));
      }

      if (requestMethod === 'POST') {
        routerCls.post(pathArr, (ctx, next) => routerFunc(ctx, next));
      }

      if (requestMethod === 'ALL') {
        routerCls.all(pathArr, (ctx, next) => routerFunc(ctx, next));
      }
    });
    this.app.use(routerCls.routes());
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

new Container(new setResponse());
