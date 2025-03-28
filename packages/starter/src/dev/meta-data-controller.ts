import { assemble, isClass } from '@decorator-server/decorator';
import path from 'path';

import { loopDir } from '../utils';

export default class metaDataController {
  // 存储提供的类和元数据
  public provideGroup = new Map<string, itemType>();
  // 存储全局注入的对象
  public globalInject = new Map<string, any>();

  // 读取目录下的 ts 文件,并且获取类的元数据
  public async loadClassesFromDirectory(rootPath: string) {
    try {
      await loopDir(rootPath, this.readFileCreateMeta.bind(this));
    } catch (error) {
      console.error('遍历目录加载类时出错:', error);
      throw new Error('无法加载类');
    }
  }

  /** 迭代所有 src 下的 ts 文件初始化 meta 和 require 文件 */
  public readFileCreateMeta = async (
    pathUrl: string,
    name: string,
    isDir: boolean,
  ) => {
    if (isDir) return;
    const filePath = path.resolve(pathUrl, name);
    try {
      const module = await import(filePath);
      const values = Object.values(module);
      values.forEach((v) => this.getClassMetaData(v));
    } catch (error) {
      console.error(`加载文件 ${filePath} 时出错:`, error);
    }
  };

  // 获取类的元数据
  public getClassMetaData(cls: any) {
    if (!isClass(cls)) {
      return;
    }
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
}
