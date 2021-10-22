export declare const loopDir: (url: string, cb: (cbPath: string, name: string, isDir: boolean) => void) => Promise<void>;
export declare const portIsOccupied: (port: number) => Promise<number>;
export declare const getArg: () => {
    [key: string]: string;
};
