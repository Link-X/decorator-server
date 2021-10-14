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
        const { controller = [], router = [] } = meta;
        if (!(controller && controller.length))
            return;
        const routerCls = new router_1.default({
            prefix: controller[0].prefix || undefined,
        });
        router.forEach((v) => {
            const route = v.route || [];
            const routerFunc = (ctx, next, propertyName) => {
                const rv = clsObj[propertyName](ctx);
                if (rv) {
                    ctx.body = rv;
                }
                next();
            };
            const pathArr = route.map((v) => v.path);
            const { requestMethod, propertyName } = route[0];
            if (requestMethod === 'GET') {
                routerCls.get(pathArr, (ctx, next) => routerFunc(ctx, next, propertyName));
            }
            if (requestMethod === 'POST') {
                routerCls.post(pathArr, (ctx, next) => routerFunc(ctx, next, propertyName));
            }
            if (requestMethod === 'ALL') {
                routerCls.all(pathArr, (ctx, next) => routerFunc(ctx, next, propertyName));
            }
        });
        this.app.use(routerCls.routes());
    }
    injectSet(inject, clsObj) {
        if (!inject)
            return;
        Object.keys(inject).forEach((v) => {
            const item = inject[v][0];
            const providMeta = this.provideGroup.get(item.injectVal);
            clsObj[v] = providMeta.cls;
        });
    }
    bind(cls) {
        const meta = (0, decorator_1.assemble)(cls);
        if (!meta)
            return;
        this.provideGroup.set(meta.base.id, { cls: new cls(), meta });
    }
    install() {
        this.app = new koa_1.default();
        this.app.use((0, koa_body_1.default)());
        for (const provideItem of this.provideGroup.values()) {
            this.injectSet(provideItem.meta.inject, provideItem.cls);
            this.routerSet(provideItem.meta, provideItem.cls);
        }
        this.app.listen(9301);
    }
    async init() {
        await (0, utils_1.loopDir)(this.rootPath, this.expCls);
        this.install();
        console.log(JSON.stringify(this.provideGroup.get('SomeClass')));
        console.log('http://localhost:9301/');
    }
}
exports.Container = Container;
const containerCls = new Container();
containerCls.init();
