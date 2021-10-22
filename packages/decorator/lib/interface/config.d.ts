import Koa, { Context } from 'koa';
import Router from '@koa/router';
/**
 * 生命周期定义
 */
export interface LifeCycle {
    onReady(container: ContainerType, app?: Koa): Promise<void>;
    onStop?(container: ContainerType, app?: Koa): Promise<void>;
}
interface ContainerType {
    provideGroup: Map<string, itemType>;
    app: Koa;
    rootPath: string;
    setRouters: setRouters;
    /** 迭代所有src下的ts文件初始化meta 和require 文件 */
    expCls: (pathUrl: string, name: string, isDir: boolean) => void;
    bind(cls: any): void;
    koaRouterInit(meta: metaType, clsObj: any): void;
    injectInit(inject: injectType, clsObj: any): void;
    installKoa(): void;
    init(): Promise<void>;
}
interface setResponse {
    modify: (response: responseType[], ctx: Context) => void;
    responseContentType(ctx: Context, item: responseType): void;
    responseHttpCode(ctx: Context, item: responseType): void;
    responseHeader(ctx: Context, item: responseType): void;
    responseRedirect(ctx: Context, item: responseType): void;
}
interface setRouters {
    createRouter: (meta: metaType, clsObj: any) => Router<Koa.DefaultState, Koa.DefaultContext> | undefined;
    setResponse: setResponse;
    /** 执行router装饰器的函数 */
    routerCallback(ctx: Context, obj: any, v: routerType): Promise<void>;
}
interface routeType {
    requestMethod: 'GET' | 'POST' | 'ALL' | 'HEAD' | 'OPTIONS';
    propertyName: string;
    path: string;
    middleware: any[];
}
declare type baseType = {
    uuid: string;
    orginName: string;
    id: string;
};
declare type controllerType = {
    prefix: string;
    routerOptions: {
        middleware: any[];
    };
};
declare type responseType = {
    type: string;
    url: string;
    code: any;
    setHeaders?: any;
    [string: string]: string;
};
declare type routerType = {
    route: routeType[];
    methodName: string;
    params?: any;
    response?: responseType[];
};
declare type injectType = {
    [string: string]: {
        value: string;
        key: string;
        injectVal: string;
    }[];
};
declare type metaType = {
    base: baseType;
    controller: controllerType[];
    router: routerType[];
    inject: injectType;
};
declare type itemType = {
    cls: any;
    meta: metaType;
};
export {};
