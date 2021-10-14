import path from 'path';
import { walk } from '@root/walk';

import { assemble, isClass } from '@decorator-server/decorator';

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

const init = async () => {
  await walk(
    rootPath,
    async (
      err: any,
      pathname: string,
      dirent: { name: string; isDirectory: any },
    ) => {
      if (err) {
        throw err;
      }
      const pathUrl = path.dirname(pathname);
      const { name } = dirent;
      if (dirent.isDirectory() && name.startsWith('.')) {
        return false;
      }
      if (name.includes('.d.ts')) return;
      if (!dirent.isDirectory()) {
        const def = Object.values(require(`${pathUrl}/${name}`));
        Object.values(def).forEach((v) => {
          if (isClass(v)) {
            containerCls.bind(v);
          }
        });
      }
    },
  );
};
(async () => {
  await init();
  console.log(containerCls.provideGroup)
})();
// const containerCls = new Container();
// Object.values(Exp).forEach((v) => {
//   containerCls.bind(v);
// });
