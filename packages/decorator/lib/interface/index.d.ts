import Application, { Context } from 'koa';
import Router from '@koa/router';
/**
 * 生命周期定义
 */
export interface LifeCycle {
    onReady(container: Container, app?: Application): Promise<void>;
    onStop?(container: Container, app?: Application): Promise<void>;
}
export interface setResponse {
    modify: (response: responseType[], ctx: Context) => void;
    responseContentType(ctx: Context, item: responseType): void;
    responseHttpCode(ctx: Context, item: responseType): void;
    responseHeader(ctx: Context, item: responseType): void;
    responseRedirect(ctx: Context, item: responseType): void;
}
export interface setRouters {
    createRouter: (meta: metaType, clsObj: any) => Router<Application.DefaultState, Application.DefaultContext> | undefined;
}
export interface Container {
    provideGroup: Map<string, itemType>;
    globalInject: Map<string, any>;
    app: Application;
    rootPath: string;
    /** 注册全局依赖api, 这个api只在init.ts 的onReady内有效 */
    registerObject(identifier: string, target: any, params?: any): void;
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
