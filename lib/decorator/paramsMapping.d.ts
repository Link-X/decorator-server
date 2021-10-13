export declare enum RouteParamTypes {
    QUERY = 0,
    BODY = 1,
    PARAM = 2,
    HEADERS = 3,
    SESSION = 4,
    FILESTREAM = 5,
    FILESSTREAM = 6,
    NEXT = 7,
    REQUEST_PATH = 8,
    REQUEST_IP = 9,
    QUERIES = 10
}
export declare const Query: (property?: string | undefined) => (target: any, propertyName: string, index: number) => void;
export declare const Body: (property?: string | undefined) => (target: any, propertyName: string, index: number) => void;
export declare const Session: (property?: string | undefined) => (target: any, propertyName: string, index: number) => void;
export declare const Param: (property?: string | undefined) => (target: any, propertyName: string, index: number) => void;
export declare const Headers: (property?: string | undefined) => (target: any, propertyName: string, index: number) => void;
export declare const File: (property?: metaType.GetFileStreamOptions | undefined) => (target: any, propertyName: string, index: number) => void;
export declare const Files: (property?: metaType.GetFilesStreamOptions | undefined) => (target: any, propertyName: string, index: number) => void;
export declare const RequestPath: () => (target: any, propertyName: string, index: number) => void;
export declare const RequestIP: () => (target: any, propertyName: string, index: number) => void;
export declare const Queries: (property?: string | undefined) => (target: any, propertyName: string, index: number) => void;
