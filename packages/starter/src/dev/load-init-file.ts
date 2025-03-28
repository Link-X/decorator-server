import fs from 'fs/promises';
import Koa from 'koa';
import { isClass } from '@decorator-server/decorator';

export default class loadInitFile {
  app: Koa;
  initPath: string;

  // 读取init文件
  public async executeInitFile() {
    try {
      await fs.access(this.initPath);
      const { default: cls } = await import(this.initPath);
      if (isClass(cls)) {
        const initCls = new cls();
        return await initCls.onReady(this, this.app);
      }
    } catch (err) {
      console.log(err)
      console.log('没找到 init 文件');
    }
  }
}
