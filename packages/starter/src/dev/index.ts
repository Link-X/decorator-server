import path from 'path';
import Koa from 'koa';
import Router from '@koa/router';
import KoaBody from 'koa-body';

import { assemble, isClass } from '@decorator-server/decorator';
import { loopDir } from '../utils';

export class Container {
  provideGroup = new Map<string, itemType>();
  app: Koa;
  rootPath = path.resolve(process.cwd(), 'lib');

  expCls = (pathUrl: string, name: string, isDir: boolean) => {
    if (isDir) return;
    const def = Object.values(require(path.resolve(pathUrl, name)));
    Object.values(def).forEach((v) => {
      if (isClass(v)) {
        this.bind(v);
      }
    });
  };

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
      const pathArr = route.map((v) => v.path);
      const { requestMethod, propertyName } = route[0];
      if (requestMethod === 'GET') {
        routerCls.get(pathArr, (ctx, next) =>
          routerFunc(ctx, next, propertyName),
        );
      }

      if (requestMethod === 'POST') {
        routerCls.post(pathArr, (ctx, next) =>
          routerFunc(ctx, next, propertyName),
        );
      }

      if (requestMethod === 'ALL') {
        routerCls.all(pathArr, (ctx, next) =>
          routerFunc(ctx, next, propertyName),
        );
      }
    });
    this.app.use(routerCls.routes());
  }

  injectSet(inject: injectType, clsObj: any) {
    if (!inject) return;
    Object.keys(inject).forEach((v) => {
      const item = inject[v][0];
      const providMeta = this.provideGroup.get(item.injectVal) as itemType;
      clsObj[v] = providMeta.cls;
    });
  }

  bind(cls: any) {
    const meta = assemble(cls);
    if (!meta) return;
    this.provideGroup.set(meta.base.id, { cls: new cls(), meta });
  }

  install() {
    this.app = new Koa();
    this.app.use(KoaBody());
    for (const provideItem of this.provideGroup.values()) {
      this.injectSet(provideItem.meta.inject, provideItem.cls);
      this.routerSet(provideItem.meta, provideItem.cls);
    }
    this.app.listen(9301);
  }

  async init() {
    await loopDir(this.rootPath, this.expCls);
    this.install();
    console.log(JSON.stringify(this.provideGroup.get('SomeClass')));
    console.log('http://localhost:9301/');
  }
}

const containerCls = new Container();
containerCls.init();
