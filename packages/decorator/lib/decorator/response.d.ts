export declare const Redirect: (url: string, code?: number) => (target: any, key: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const HttpCode: (code: number) => (target: any, key: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const SetHeader: (headerKey: string | Record<string, any>, value?: string | undefined) => (target: any, key: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
export declare const ContentType: (contentType: string) => (target: any, key: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
