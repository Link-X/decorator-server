import "reflect-metadata";
export declare const isFunction: (val: any) => boolean;
export declare const isConstructor: (val: string) => boolean;
/**
 * get parameter name from function
 * @param func
 */
export declare function getParamNames(func: any): string[];
export declare const mapRouter: (instance: any) => metaType.routerMetaList;
export declare const assemble: (cls: any) => {
    base: any;
    controller: any;
    router: metaType.routerMetaList;
    inject: any;
    objectDef: any;
} | undefined;
