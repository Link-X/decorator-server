"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = exports.setResponse = void 0;
const path_1 = __importDefault(require("path"));
const koa_1 = __importDefault(require("koa"));
const router_1 = __importDefault(require("@koa/router"));
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
        /** 根据meta修改response */
        this.modify = (response, ctx) => {
            // @ts-expect-error: TODO
            response.forEach((v) => this[v.type](ctx, v));
        };
    }
    responseContentType(ctx, item) {
        const type = contentTypes[item.contentType] || item.contentType;
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
        /** 根据meta创建route */
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
                const requestMethod = route[0].requestMethod.toLocaleLowerCase();
                routerCls[requestMethod](pathArr, async (ctx, next) => {
                    await this.routerCallback(ctx, clsObj, v);
                    next();
                });
            });
            return routerCls;
        };
    }
    /** 执行router装饰器的函数 */
    async routerCallback(ctx, obj, v) {
        const { methodName, response = [] } = v;
        let result;
        const fn = obj[methodName].bind(obj);
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
        this.globalInject = new Map();
        this.rootPath = path_1.default.resolve(process.cwd(), 'lib');
        this.initPath = path_1.default.resolve(this.rootPath, 'init.js');
        /** 迭代所有src下的ts文件初始化meta 和require 文件 */
        this.expCls = (pathUrl, name, isDir) => {
            if (isDir)
                return;
            const filePath = path_1.default.resolve(pathUrl, name);
            if (this.initPath === filePath) {
                return;
            }
            const def = Object.values(require(filePath));
            Object.values(def).forEach((v) => {
                if ((0, decorator_1.isClass)(v)) {
                    this.provideBind(v);
                }
            });
        };
        this.setRouters = res;
        this.init();
    }
    provideBind(cls) {
        const meta = (0, decorator_1.assemble)(cls);
        if (!meta)
            return;
        this.provideGroup.set(meta.base.id, { cls: new cls(), meta });
    }
    /** 注册全局依赖api, 这个api只在init.ts 的onReady内有效 */
    registerObject(identifier, target, params) {
        if (!(0, decorator_1.isClass)(target)) {
            throw new Error(`${identifier}: 不是一个class 无法注册`);
        }
        this.globalInject.set(`globalInject-${identifier}`, new target(params));
    }
    /** 初始化koa router */
    koaRouterInit(meta, clsObj) {
        const route = this.setRouters.createRouter(meta, clsObj);
        if (!route)
            return;
        this.app.use(route.routes());
    }
    // 注册class 自定义和全局的依赖
    injectInit(inject, clsObj) {
        if (!inject)
            return;
        Object.keys(inject).forEach((v) => {
            const item = inject[v][0];
            const providMeta = this.provideGroup.get(item.injectVal);
            if (!providMeta) {
                const globalInjectCls = this.globalInject.get(`globalInject-${item.injectVal}`);
                clsObj[v] = globalInjectCls;
                return;
            }
            /** 注入 */
            clsObj[v] = providMeta.cls;
        });
    }
    async initFile() {
        const cls = require(this.initPath);
        if ((0, decorator_1.isClass)(cls.default)) {
            const initCls = new cls.default();
            await initCls.onReady(this, this.app);
        }
    }
    async installKoa(port) {
        this.app = new koa_1.default();
        await this.initFile();
        // 根据保存的meta创建对应执行函数
        for (const provideItem of this.provideGroup.values()) {
            this.injectInit(provideItem.meta.inject, provideItem.cls);
            this.koaRouterInit(provideItem.meta, provideItem.cls);
        }
        this.app.listen(port);
    }
    async init() {
        const args = (0, utils_1.getArg)();
        const port = await (0, utils_1.portIsOccupied)(+args.port);
        await (0, utils_1.loopDir)(this.rootPath, this.expCls);
        this.installKoa(port);
        console.log(`http://localhost:${port}/`);
    }
}
exports.Container = Container;
new Container(new setRouters());
