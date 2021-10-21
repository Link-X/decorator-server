import 'reflect-metadata';
interface optType {
    middleware: any[];
}
export declare const Get: (path: string, opt?: optType) => MethodDecorator;
export declare const Post: (path: string, opt?: optType) => MethodDecorator;
export declare const All: (path: string, opt?: optType) => MethodDecorator;
export {};
