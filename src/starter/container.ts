import { assemble } from "../core/utils";
export class Container {
  constructor() {}
  provideGroup = new Map<string, any>();
  bind(cls: any) {
    const meta = assemble(cls);
    if (!meta) return;
    this.provideGroup.set(meta.base.id, { cls, meta });
    console.log(this.provideGroup)
  }
}
