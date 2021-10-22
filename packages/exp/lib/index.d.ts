import { first } from './test/a';
export declare class Test {
    aaaa(): void;
    a: number;
}
export declare class SomeClass {
    useTest: Test;
    first: first;
    sequelize: any;
    someGetMethod(): Promise<unknown>;
    redirectPath(): Promise<string>;
    getNull(): void;
    somePostMethod(key: string): {
        a: number;
        b: number;
    };
}
