"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = void 0;
const path_1 = __importDefault(require("path"));
const walk_1 = require("@root/walk");
const decorator_1 = require("@decorator-server/decorator");
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
const init = async () => {
    await (0, walk_1.walk)(rootPath, async (err, pathname, dirent) => {
        if (err) {
            throw err;
        }
        const pathUrl = path_1.default.dirname(pathname);
        const { name } = dirent;
        if (dirent.isDirectory() && name.startsWith('.')) {
            return false;
        }
        if (name.includes('.d.ts'))
            return;
        if (!dirent.isDirectory()) {
            const def = Object.values(require(`${pathUrl}/${name}`));
            Object.values(def).forEach((v) => {
                if ((0, decorator_1.isClass)(v)) {
                    containerCls.bind(v);
                }
            });
        }
    });
};
(async () => {
    await init();
    console.log(containerCls.provideGroup);
})();
// const containerCls = new Container();
// Object.values(Exp).forEach((v) => {
//   containerCls.bind(v);
// });
