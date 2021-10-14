import path from 'path';

import { assemble, isClass } from '@decorator-server/decorator';
import { loopDir } from '../utils';

const rootPath = path.resolve(process.cwd(), 'lib');

export class Container {
  provideGroup = new Map<string, any>();
  bind(cls: any) {
    const meta = assemble(cls);
    if (!meta) return;
    this.provideGroup.set(meta.base.id, { cls, meta });
  }
}

const containerCls = new Container();

const expCls = (pathUrl: string, name: string, isDir: boolean) => {
  if (isDir) return;
  const def = Object.values(require(path.resolve(pathUrl, name)));
  Object.values(def).forEach((v) => {
    if (isClass(v)) {
      containerCls.bind(v);
    }
  });
};

(async () => {
  await loopDir(rootPath, expCls);
  console.log(containerCls.provideGroup);
})();
