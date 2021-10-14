import path from 'path';
import Koa from 'koa';
import Router from '@koa/router';
import KoaBody from 'koa-body';

import { assemble, isClass } from '@decorator-server/decorator';
import { loopDir } from '../utils';

interface routeType {
  requestMethod: 'GET' | 'POST' | 'HEAD' | 'OPTIONS';
  propertyName: string;
  path: string;
  middleware: any[];
}

type baseType = {
  uuid: string;
  orginName: string;
  id: string;
};

type controllerType = { prefix: string; routerOptions: { middleware: any[] } };

type routerType = { route: routeType[]; methodName: string; params: any };

type inject = {
  [string: string]: { value: string; key: string; injectVal: string };
};

type metaType = {
  base: baseType;
  controller: controllerType[];
  router: routerType[];
  inject: inject[];
};

type itemType = {
  cls: any;
  meta: metaType;
};

export class Container {
  provideGroup = new Map<string, itemType>();
  app: Koa;
  router: any[] = [];
  rootPath = path.resolve(process.cwd(), 'lib');

  routerSet(meta: metaType, clsObj: any) {
    const { controller = [], router = [] } = meta;
    if (!(controller && controller.length)) return;
    const routerCls = new Router({
      prefix: controller[0].prefix || undefined,
    });
    router.forEach((v) => {
      const route = v.route || [];
      const routerFunc = (ctx: any, next: any, propertyName: string) => {
        const rv = clsObj[propertyName](ctx);
        if (rv) {
          ctx.body = rv;
        }
        next();
      };
      route.forEach((j) => {
        const { requestMethod } = j;

        if (requestMethod === 'GET') {
          routerCls.get(j.path, (ctx, next) =>
            routerFunc(ctx, next, j.propertyName),
          );
        }
        if (requestMethod === 'POST') {
          routerCls.post(j.path, (ctx, next) =>
            routerFunc(ctx, next, j.propertyName),
          );
        }
      });
    });
    this.router.push(routerCls.routes());
  }

  bind(cls: any) {
    const meta = assemble(cls);
    if (!meta) return;
    const clsObj = new cls();
    this.routerSet(meta, clsObj);
    this.provideGroup.set(meta.base.id, { cls: clsObj, meta });
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

  async init() {
    this.app = new Koa();
    this.app.use(KoaBody());
    await loopDir(this.rootPath, this.expCls);
    this.router.forEach((item) => {
      this.app.use(item);
    });
    this.app.listen(9301);
    console.log('http://localhost:9301/');
  }
}

const containerCls = new Container();
containerCls.init();
