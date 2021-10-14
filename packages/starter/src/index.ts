import { assemble } from '@decorator-server/decorator';

export class Container {
  provideGroup = new Map<string, any>();
  bind(cls: any) {
    const meta = assemble(cls);
    if (!meta) return;
    this.provideGroup.set(meta.base.id, { cls, meta });
    console.log(this.provideGroup);
  }
}
console.log(process.cwd(), '11');
// const containerCls = new Container();
// Object.values(Exp).forEach((v) => {
//   containerCls.bind(v);
// });
