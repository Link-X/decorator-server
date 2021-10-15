import Koa from 'koa';
export declare class setResponse {
    [string: string]: (ctx: ctxType, item: responseType) => void;
    responseContentType(ctx: ctxType, item: responseType): void;
    responseHttpCode(ctx: ctxType, item: responseType): void;
    responseHeader(ctx: ctxType, item: responseType): void;
    responseRedirect(ctx: ctxType, item: responseType): void;
}
export declare class Container {
    provideGroup: Map<string, itemType>;
    app: Koa;
    rootPath: string;
    resCls: setResponse;
    constructor(res: setResponse);
    expCls: (pathUrl: string, name: string, isDir: boolean) => void;
    bind(cls: any): void;
    koaRouterInit(meta: metaType, clsObj: any): void;
    injectInit(inject: injectType, clsObj: any): void;
    installKoa(): void;
    init(): Promise<void>;
}
