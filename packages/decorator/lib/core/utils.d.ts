import 'reflect-metadata';
export declare const isFunction: (val: any) => boolean;
export declare const isConstructor: (val: string) => boolean;
/**
 * 获取类型名字
 */
export declare function getParamNames(func: any): string[];
/** 解析router 装饰器的元数据 */
export declare const mapRouter: (instance: any) => metaType.routerMetaList;
/** 解析class的元数据 */
export declare const assemble: (cls: any) => {
    base: any;
    controller: any;
    router: metaType.routerMetaList;
    inject: any;
    objectDef: any;
} | undefined;
export declare function isClass(fn: any): boolean;
export declare const isObject: (val: any) => boolean;
export declare const isPromise: (val: any) => boolean | undefined;
