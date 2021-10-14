import Koa from 'koa';
interface routeType {
    requestMethod: 'GET' | 'POST' | 'HEAD' | 'OPTIONS';
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
declare type routerType = {
    route: routeType[];
    methodName: string;
    params: any;
};
declare type inject = {
    [string: string]: {
        value: string;
        key: string;
        injectVal: string;
    };
};
declare type metaType = {
    base: baseType;
    controller: controllerType[];
    router: routerType[];
    inject: inject[];
};
declare type itemType = {
    cls: any;
    meta: metaType;
};
export declare class Container {
    provideGroup: Map<string, itemType>;
    app: Koa;
    router: any[];
    rootPath: string;
    routerSet(meta: metaType, clsObj: any): void;
    bind(cls: any): void;
    expCls: (pathUrl: string, name: string, isDir: boolean) => void;
    init(): Promise<void>;
}
export {};
