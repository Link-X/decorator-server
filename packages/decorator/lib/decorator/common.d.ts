import "reflect-metadata";
/** 保存装饰器元数据 */
export declare const saveMeta: (target: any, data: any, metaKey: string, propertyName: string) => void;
/** 保存特数据装饰器元数据 */
export declare function saveObjectDefProps(target: any, props?: {}): any;
