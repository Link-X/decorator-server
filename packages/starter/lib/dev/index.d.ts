import Koa, { Context } from 'koa';
import Router from '@koa/router';
export declare class setResponse {
    modify: (response: responseType[], ctx: Context) => void;
    constructor();
    responseContentType(ctx: Context, item: responseType): void;
    responseHttpCode(ctx: Context, item: responseType): void;
    responseHeader(ctx: Context, item: responseType): void;
    responseRedirect(ctx: Context, item: responseType): void;
}
declare class setRouters {
    createRouter: (meta: metaType, clsObj: any) => Router<Koa.DefaultState, Koa.DefaultContext> | undefined;
    private setResponse;
    constructor();
    /** 执行router装饰器的函数 */
    private routerCallback;
}
export declare class Container {
    provideGroup: Map<string, itemType>;
    globalInject: Map<string, any>;
    app: Koa;
    rootPath: string;
    initPath: string;
    private setRouters;
    constructor(res: setRouters);
    /** 迭代所有src下的ts文件初始化meta 和require 文件 */
    private expCls;
    private provideBind;
    /** 注册全局依赖api, 这个api只在init.ts 的onReady内有效 */
    registerObject(identifier: string, target: any, params?: any): void;
    /** 初始化koa router */
    private koaRouterInit;
    private injectInit;
    private initFile;
    private installKoa;
    private init;
}
export {};
