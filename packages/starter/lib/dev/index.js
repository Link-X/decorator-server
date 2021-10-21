"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = exports.setResponse = void 0;
const path_1 = __importDefault(require("path"));
const koa_1 = __importDefault(require("koa"));
const router_1 = __importDefault(require("@koa/router"));
const koa_body_1 = __importDefault(require("koa-body"));
const decorator_1 = require("@decorator-server/decorator");
const utils_1 = require("../utils");
const contentTypes = {
    html: 'text/html',
    json: 'application/json',
    text: 'text/plain',
    form: 'multipart/form-data',
};
class setResponse {
    constructor() {
        this.modify = (response, ctx) => {
            // @ts-expect-error: TODO
            response.forEach((v) => this[v.type](ctx, v));
        };
    }
    responseContentType(ctx, item) {
        const type = contentTypes[item.contentType] || contentTypes[item.contentType];
        ctx.set('content-type', type);
    }
    responseHttpCode(ctx, item) {
        ctx.response.status = item.code;
    }
    responseHeader(ctx, item) {
        ctx.set(item.setHeaders);
    }
    responseRedirect(ctx, item) {
        ctx.response.redirect(item.url);
        this.responseHttpCode(ctx, item);
    }
}
exports.setResponse = setResponse;
class setRouters {
    constructor() {
        this.setResponse = new setResponse();
        this.createRouter = (meta, clsObj) => {
            const { controller = [], router = [] } = meta;
            if (!(controller && controller.length))
                return;
            const routerCls = new router_1.default({
                prefix: controller[0].prefix || undefined,
            });
            router.forEach((v) => {
                const { route = [] } = v;
                const pathArr = (route || []).map((v) => v.path);
                const routerFunc = async (ctx, next) => {
                    await this.routerCallback(ctx, clsObj, v);
                    next();
                };
                const { requestMethod } = route[0];
                if (requestMethod === 'GET') {
                    routerCls.get(pathArr, routerFunc);
                }
                if (requestMethod === 'POST') {
                    routerCls.post(pathArr, routerFunc);
                }
                if (requestMethod === 'ALL') {
                    routerCls.all(pathArr, routerFunc);
                }
            });
            return routerCls;
        };
    }
    async routerCallback(ctx, obj, v) {
        const { methodName, response = [] } = v;
        let result;
        const fn = obj[methodName];
        if ((0, decorator_1.isPromise)(fn)) {
            result = await fn(ctx);
        }
        else {
            result = fn(ctx);
        }
        if ((0, decorator_1.isPromise)(result)) {
            await result;
        }
        this.setResponse.modify(response, ctx);
        if (result) {
            ctx.body = result;
        }
    }
}
class Container {
    constructor(res) {
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
        this.setRouters = res;
        this.init();
    }
    bind(cls) {
        const meta = (0, decorator_1.assemble)(cls);
        if (!meta)
            return;
        this.provideGroup.set(meta.base.id, { cls: new cls(), meta });
    }
    koaRouterInit(meta, clsObj) {
        const route = this.setRouters.createRouter(meta, clsObj);
        if (!route)
            return;
        this.app.use(route.routes());
    }
    injectInit(inject, clsObj) {
        if (!inject)
            return;
        Object.keys(inject).forEach((v) => {
            const item = inject[v][0];
            const providMeta = this.provideGroup.get(item.injectVal);
            clsObj[v] = providMeta.cls;
        });
    }
    installKoa() {
        this.app = new koa_1.default();
        this.app.use((0, koa_body_1.default)());
        for (const provideItem of this.provideGroup.values()) {
            this.injectInit(provideItem.meta.inject, provideItem.cls);
            this.koaRouterInit(provideItem.meta, provideItem.cls);
        }
        this.app.listen(9301);
    }
    async init() {
        await (0, utils_1.loopDir)(this.rootPath, this.expCls);
        this.installKoa();
        console.log('http://localhost:9301/');
    }
}
exports.Container = Container;
new Container(new setRouters());
