import Koa from 'koa';
export declare class Container {
    provideGroup: Map<string, itemType>;
    app: Koa;
    rootPath: string;
    expCls: (pathUrl: string, name: string, isDir: boolean) => void;
    routerSet(meta: metaType, clsObj: any): void;
    injectSet(inject: injectType, clsObj: any): void;
    bind(cls: any): void;
    install(): void;
    init(): Promise<void>;
}
