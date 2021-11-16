import path from 'path';
import Koa from 'koa';
import fs from 'fs';

import { assemble, isClass } from '@decorator-server/decorator';
import { loopDir, portIsOccupied, getArg } from '../utils';
import SetRouters from './set-router';

export class Container {
  public provideGroup = new Map<string, itemType>();
  public globalInject = new Map<string, any>();
  public app: Koa;
  public rootPath = path.resolve(process.cwd(), 'lib');
  public initPath = path.resolve(this.rootPath, 'init.js');
  private setRouters: SetRouters;

  constructor(res: SetRouters) {
    this.setRouters = res;
    this.init();
  }

  /** 迭代所有src下的ts文件初始化meta 和require 文件 */
  private expCls = (pathUrl: string, name: string, isDir: boolean) => {
    if (isDir) return;
    const filePath = path.resolve(pathUrl, name);
    if (this.initPath === filePath) {
      return;
    }
    const def = Object.values(require(filePath));
    Object.values(def).forEach((v) => {
      if (isClass(v)) {
        this.provideBind(v);
      }
    });
  };

  private provideBind(cls: any) {
    const meta = assemble(cls);
    if (!meta) return;
    this.provideGroup.set(meta.base.id, { cls: new cls(), meta });
  }

  /** 注册全局依赖api, 这个api只在init.ts 的onReady内有效 */
  public registerObject(identifier: string, target: any, params?: any) {
    if (!isClass(target)) {
      throw new Error(`${identifier}: 不是一个class 无法注册`);
    }
    this.globalInject.set(`globalInject-${identifier}`, new target(params));
  }

  /** 初始化koa router */
  private koaRouterInit(meta: metaType, clsObj: any) {
    const route = this.setRouters.createRouter(meta, clsObj);
    if (!route) return;
    this.app.use(route.routes());
  }

  // 注册class 自定义和全局的依赖
  private injectInit(inject: injectType, clsObj: any) {
    if (!inject) return;
    Object.keys(inject).forEach((v) => {
      const item = inject[v][0];
      const providMeta = this.provideGroup.get(item.injectVal) as itemType;

      /** 没有在provdeGroup找到的话可能是全局依赖 */
      if (!providMeta) {
        const globalInjectCls = this.globalInject.get(
          `globalInject-${item.injectVal}`,
        );
        clsObj[v] = globalInjectCls;
        return;
      }

      /** 注入 */
      clsObj[v] = providMeta.cls;
    });
  }

  private async initFile() {
    try {
      await fs.statSync(this.initPath);
      const cls = require(this.initPath);
      if (isClass(cls.default)) {
        const initCls = new cls.default();
        await initCls.onReady(this, this.app);
      }
    } catch (err) {
      console.log('没找到init文件');
    }
  }

  private async installKoa(port: number) {
    this.app = new Koa();
    await this.initFile();
    // 根据保存的meta创建对应执行函数
    for (const provideItem of this.provideGroup.values()) {
      this.injectInit(provideItem.meta.inject, provideItem.cls);
      this.koaRouterInit(provideItem.meta, provideItem.cls);
    }
    this.app.listen(port);
  }

  private async init() {
    const args = getArg();
    const port = await portIsOccupied(+args.port);
    await loopDir(this.rootPath, this.expCls);
    this.installKoa(port);
    console.log(`http://localhost:${port}/`);
  }
}

new Container(new SetRouters());
