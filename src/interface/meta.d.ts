declare namespace metaType {
  export type methodType = "GET" | "POST" | "PUT" | "DELETE" | "ALL";

  export interface routerMeta {
    route: any[];
    params: any[];
    methodName: string;
    response: any[];
  }

  export type routerMetaList = routerMeta[];

  export interface GetFileStreamOptions {
    requireFile?: boolean; // required file submit, default is true
    defCharset?: string;
    limits?: {
      fieldNameSize?: number;
      fieldSize?: number;
      fields?: number;
      fileSize?: number;
      files?: number;
      parts?: number;
      headerPairs?: number;
    };

    checkFile?(
      fieldname: string,
      file: any,
      filename: string,
      encoding: string,
      mimetype: string
    ): void | Error;
  }

  export interface GetFilesStreamOptions extends GetFileStreamOptions {
    autoFields?: boolean;
  }
}
