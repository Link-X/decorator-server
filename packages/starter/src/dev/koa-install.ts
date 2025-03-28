import path from 'path';
import Koa from 'koa';

import { portIsOccupied, getArg, getLocalIP } from '../utils';
import SetRouters from './set-router';
import loadInitFile from './load-init-file';
import metaDataController from './meta-data-controller';

export class Container {
  public app = new Koa();
  // 项目根路径
  public rootPath = path.resolve(process.cwd(), 'lib');
  // 初始化文件路径
  public initPath = path.resolve(this.rootPath, 'init.js');
  private loadInitFile = new loadInitFile();
  private metaDataController = new metaDataController();
  private setRouters = new SetRouters();

  constructor() {
    this.init().catch((error) => {
      console.error('初始化过程中出现严重错误:', error);
    });
  }

  private async init() {
    const args = getArg();
    const port = await this.ensurePortIsAvailable(
      Object.keys(args)[0] as string,
    );
    await this.metaDataController.loadClassesFromDirectory(this.rootPath);
    await this.setupKoaServer(port);
  }

  private async ensurePortIsAvailable(port: string | number) {
    try {
      return await portIsOccupied(Number(port));
    } catch (error) {
      console.log(port, 'debugger-xdb');
      console.error('端口检查出错:', error);
      throw new Error('无法确定端口可用性');
    }
  }

  private async setupKoaServer(port: number) {
    await this.loadInitFile.executeInitFile.call(this);
    this.configureDependenciesAndRoutes();
    await this.startKoaServer(port);
  }

  private configureDependenciesAndRoutes() {
    for (const provideItem of this.metaDataController.provideGroup.values()) {
      this.injectDependencies(provideItem.meta.inject, provideItem.cls);
      this.setupKoaRouter(provideItem.meta, provideItem.cls);
    }
  }

  private async startKoaServer(port: number) {
    return new Promise((resolve) => {
      this.app.listen(port, () => {
        console.log(`服务器已启动，监听端口: ${port}`);
        this.logServerUrls(port);
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

  /** 注册全局依赖 api, 这个 api 只在 init.ts 的 onReady 内有效 */
  public registerObject(identifier: string, target: any, params?: any) {
    console.log(identifier, 'debugger-xdb');
    return this.metaDataController.registerObject(identifier, target, params);
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
      const providMeta = this.metaDataController.provideGroup.get(
        item.injectVal,
      ) as itemType;

      /** 没有在 provdeGroup 找到的话可能是全局依赖 */
      if (!providMeta) {
        const globalInjectCls = this.metaDataController.globalInject.get(
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
// export default () => {

// };
new Container();
