import { first } from './test/a';
export declare class Test {
    aaaa(): void;
    a: number;
}
export declare class SomeClass {
    useTest: Test;
    first: first;
    someGetMethod(): string;
    redirectPath(): string;
    somePostMethod(key: string): {
        a: number;
        b: number;
    };
}
