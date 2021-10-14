"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = void 0;
const path_1 = __importDefault(require("path"));
const decorator_1 = require("@decorator-server/decorator");
const utils_1 = require("../utils");
const rootPath = path_1.default.resolve(process.cwd(), 'lib');
class Container {
    constructor() {
        this.provideGroup = new Map();
    }
    bind(cls) {
        const meta = (0, decorator_1.assemble)(cls);
        if (!meta)
            return;
        this.provideGroup.set(meta.base.id, { cls, meta });
    }
}
exports.Container = Container;
const containerCls = new Container();
const expCls = (pathUrl, name, isDir) => {
    if (isDir)
        return;
    const def = Object.values(require(path_1.default.resolve(pathUrl, name)));
    Object.values(def).forEach((v) => {
        if ((0, decorator_1.isClass)(v)) {
            containerCls.bind(v);
        }
    });
};
(async () => {
    await (0, utils_1.loopDir)(rootPath, expCls);
    console.log(containerCls.provideGroup);
})();
