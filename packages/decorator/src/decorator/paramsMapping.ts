import { getParamNames } from "../core/utils";
import { ROUTER_PARAMS } from "../variable/reflect-var";
import { saveMeta } from "./common";

export enum RouteParamTypes {
  QUERY,
  BODY,
  PARAM,
  HEADERS,
  SESSION,
  FILESTREAM,
  FILESSTREAM,
  NEXT,
  REQUEST_PATH,
  REQUEST_IP,
  QUERIES,
}

const createParamMapping = (type: RouteParamTypes) => {
  return (propertyData?: any) =>
    (target: any, propertyName: string, index: number) => {
      if (propertyData === undefined) {
        propertyData = getParamNames(target[propertyName])[index];
      }
      saveMeta(
        target,
        {
          index,
          type,
          propertyData,
        },
        ROUTER_PARAMS,
        propertyName
      );
    };
};

export const Query = (property?: string) =>
  createParamMapping(RouteParamTypes.QUERY)(property);
export const Body = (property?: string) =>
  createParamMapping(RouteParamTypes.BODY)(property);
export const Session = (property?: string) =>
  createParamMapping(RouteParamTypes.SESSION)(property);
export const Param = (property?: string) =>
  createParamMapping(RouteParamTypes.PARAM)(property);
export const Headers = (property?: string) =>
  createParamMapping(RouteParamTypes.HEADERS)(property);
export const File = (property?: metaType.GetFileStreamOptions) =>
  createParamMapping(RouteParamTypes.FILESTREAM)(property);
export const Files = (property?: metaType.GetFilesStreamOptions) =>
  createParamMapping(RouteParamTypes.FILESSTREAM)(property);
export const RequestPath = () =>
  createParamMapping(RouteParamTypes.REQUEST_PATH)();
export const RequestIP = () => createParamMapping(RouteParamTypes.REQUEST_IP)();
export const Queries = (property?: string) =>
  createParamMapping(RouteParamTypes.QUERIES)(property);
