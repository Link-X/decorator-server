"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = void 0;
const utils_1 = require("../core/utils");
class Container {
    constructor() {
        this.provideGroup = new Map();
    }
    bind(cls) {
        const meta = (0, utils_1.assemble)(cls);
        if (!meta)
            return;
        this.provideGroup.set(meta.base.id, { cls, meta });
        console.log(this.provideGroup);
    }
}
exports.Container = Container;
