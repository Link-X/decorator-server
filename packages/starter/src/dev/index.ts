import path from 'path';
import Koa from 'koa';
import fs from 'fs/promises'; // 使用 promise 版本的 fs 模块

import { assemble, isClass } from '@decorator-server/decorator';
import { loopDir, portIsOccupied, getArg, getLocalIP } from '../utils';
import SetRouters from './set-router';

export class Container {
  // 存储提供的类和元数据
  public provideGroup = new Map<string, itemType>();
  // 存储全局注入的对象
  public globalInject = new Map<string, any>();
  public app: Koa;
  // 项目根路径
  public rootPath = path.resolve(process.cwd(), 'lib');
  // 初始化文件路径
  public initPath = path.resolve(this.rootPath, 'init.js');
  private setRouters: SetRouters;

  constructor(res: SetRouters) {
    this.setRouters = res;
    this.init().catch((error) => {
      console.error('初始化过程中出现严重错误:', error);
    });
  }

  private async init() {
    const args = getArg();
    const port = await this.ensurePortIsAvailable(args['port'] as string);
    await this.loadClassesFromDirectory();
    await this.setupKoaServer(port);
    this.logServerUrls(port);
  }

  private async ensurePortIsAvailable(port: string | number) {
    try {
      return await portIsOccupied(Number(port));
    } catch (error) {
      console.error('端口检查出错:', error);
      throw new Error('无法确定端口可用性');
    }
  }

  private async loadClassesFromDirectory() {
    try {
      await loopDir(this.rootPath, this.expCls.bind(this));
    } catch (error) {
      console.error('遍历目录加载类时出错:', error);
      throw new Error('无法加载类');
    }
  }

  private async setupKoaServer(port: number) {
    this.app = new Koa();
    await this.loadInitFile();
    this.configureDependenciesAndRoutes();
    await this.startKoaServer(port);
  }

  private async loadInitFile() {
    try {
      await fs.access(this.initPath);
      const { default: cls } = await import(this.initPath);
      if (isClass(cls)) {
        const initCls = new cls();
        await initCls.onReady(this, this.app);
      }
    } catch (err) {
      console.log('没找到 init 文件');
    }
  }

  private configureDependenciesAndRoutes() {
    for (const provideItem of this.provideGroup.values()) {
      this.injectDependencies(provideItem.meta.inject, provideItem.cls);
      this.setupKoaRouter(provideItem.meta, provideItem.cls);
    }
  }

  private async startKoaServer(port: number) {
    return new Promise((resolve) => {
      this.app.listen(port, () => {
        console.log(`服务器已启动，监听端口: ${port}`);
        resolve(port);
      });
    });
  }

  private logServerUrls(port: number) {
    const localIP = getLocalIP();
    console.log(`http://localhost:${port}/`);
    if (localIP) {
      console.log(`http://${localIP}:${port}`);
    }
  }

  /** 迭代所有 src 下的 ts 文件初始化 meta 和 require 文件 */
  private expCls = async (pathUrl: string, name: string, isDir: boolean) => {
    if (isDir) return;
    const filePath = path.resolve(pathUrl, name);
    if (this.initPath === filePath) {
      return;
    }
    try {
      const module = await import(filePath);
      const values = Object.values(module);
      values.forEach((v) => {
        if (isClass(v)) {
          this.provideBind(v);
        }
      });
    } catch (error) {
      console.error(`加载文件 ${filePath} 时出错:`, error);
    }
  };

  private provideBind(cls: any) {
    const meta = assemble(cls);
    if (!meta) return;
    this.provideGroup.set(meta.base.id, { cls: new cls(), meta });
  }

  /** 注册全局依赖 api, 这个 api 只在 init.ts 的 onReady 内有效 */
  public registerObject(identifier: string, target: any, params?: any) {
    if (!isClass(target)) {
      throw new Error(`${identifier}: 不是一个 class 无法注册`);
    }
    this.globalInject.set(`globalInject-${identifier}`, new target(params));
  }

  /** 初始化 koa router */
  private setupKoaRouter(meta: metaType, clsObj: any) {
    const route = this.setRouters.createRouter(meta, clsObj);
    if (!route) return;
    this.app.use(route.routes());
  }

  // 注册 class 自定义和全局的依赖
  private injectDependencies(inject: injectType, clsObj: any) {
    if (!inject) return;
    Object.keys(inject).forEach((v) => {
      const item = inject[v][0];
      const providMeta = this.provideGroup.get(item.injectVal) as itemType;

      /** 没有在 provdeGroup 找到的话可能是全局依赖 */
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
}

new Container(new SetRouters());
