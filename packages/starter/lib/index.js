"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = void 0;
const decorator_1 = require("@decorator-server/decorator");
class Container {
    constructor() {
        this.provideGroup = new Map();
    }
    bind(cls) {
        const meta = (0, decorator_1.assemble)(cls);
        if (!meta)
            return;
        this.provideGroup.set(meta.base.id, { cls, meta });
        console.log(this.provideGroup);
    }
}
exports.Container = Container;
console.log(process.cwd());
// const containerCls = new Container();
// Object.values(Exp).forEach((v) => {
//   containerCls.bind(v);
// });
