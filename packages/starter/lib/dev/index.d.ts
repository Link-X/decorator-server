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
    setResponse: setResponse;
    constructor();
    routerCallback(ctx: Context, obj: any, v: routerType): Promise<void>;
}
export declare class Container {
    provideGroup: Map<string, itemType>;
    app: Koa;
    rootPath: string;
    setRouters: setRouters;
    constructor(res: setRouters);
    expCls: (pathUrl: string, name: string, isDir: boolean) => void;
    bind(cls: any): void;
    koaRouterInit(meta: metaType, clsObj: any): void;
    injectInit(inject: injectType, clsObj: any): void;
    installKoa(): void;
    init(): Promise<void>;
}
export {};
