"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = void 0;
const path_1 = __importDefault(require("path"));
const koa_1 = __importDefault(require("koa"));
const router_1 = __importDefault(require("@koa/router"));
const koa_body_1 = __importDefault(require("koa-body"));
const decorator_1 = require("@decorator-server/decorator");
const utils_1 = require("../utils");
class Container {
    constructor() {
        this.provideGroup = new Map();
        this.router = [];
        this.rootPath = path_1.default.resolve(process.cwd(), 'lib');
        this.expCls = (pathUrl, name, isDir) => {
            if (isDir)
                return;
            const def = Object.values(require(path_1.default.resolve(pathUrl, name)));
            Object.values(def).forEach((v) => {
                if ((0, decorator_1.isClass)(v)) {
                    this.bind(v);
                }
            });
        };
    }
    routerSet(meta, clsObj) {
        const { controller, router = [] } = meta;
        if (!(controller && controller.length) || !(router && router.length)) {
            return;
        }
        const routerCls = new router_1.default({
            prefix: controller[0].prefix || undefined,
        });
        router.forEach((v) => {
            const route = v.route || [];
            route.forEach((j) => {
                const { requestMethod } = j;
                const routerFunc = (ctx, next) => {
                    const rv = clsObj[j.propertyName](ctx);
                    if (rv) {
                        ctx.body = rv;
                    }
                    next();
                };
                if (requestMethod === 'GET') {
                    routerCls.get(j.path, routerFunc);
                }
                if (requestMethod === 'POST') {
                    routerCls.post(j.path, routerFunc);
                }
            });
        });
        this.router.push(routerCls.routes());
    }
    bind(cls) {
        const meta = (0, decorator_1.assemble)(cls);
        if (!meta)
            return;
        const clsObj = new cls();
        this.routerSet(meta, clsObj);
        this.provideGroup.set(meta.base.id, { cls: clsObj, meta });
    }
    async init() {
        this.app = new koa_1.default();
        await (0, utils_1.loopDir)(this.rootPath, this.expCls);
        this.app.use((0, koa_body_1.default)());
        this.router.forEach((item) => {
            this.app.use(item);
        });
        this.app.listen(9301);
        console.log(JSON.stringify(this.provideGroup.get('SomeClass')), 'http://localhost:9301/');
    }
}
exports.Container = Container;
const containerCls = new Container();
containerCls.init();
