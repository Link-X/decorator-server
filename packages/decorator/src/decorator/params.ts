import { getParamNames } from '../utils/utils';
import { ROUTER_PARAMS } from '../variable/meta-name';
import { saveMeta } from './common';

// 定义路由参数类型枚举
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

/**
 * 创建参数映射装饰器的工厂函数
 * @param type 路由参数类型，来自 RouteParamTypes 枚举
 * @returns 一个函数，该函数返回一个装饰器函数
 */
export const createParamMapping = (
  type: RouteParamTypes,
): ((
  propertyData?: any,
) => (target: any, propertyName: string, index: number) => void) => {
  return (
    propertyData?: any,
  ): ((target: any, propertyName: string, index: number) => void) => {
    return (target: any, propertyName: string, index: number): void => {
      if (propertyData === undefined) {
        propertyData = getParamNames(target[propertyName])[index];
      }
      // 保存路由参数元数据
      saveMeta(
        target,
        {
          index,
          type,
          propertyData,
        },
        ROUTER_PARAMS,
        propertyName,
      );
    };
  };
};

/**
 * Query 参数装饰器
 * @param property 可选的属性名，如果未提供则根据函数参数名推断
 * @returns 装饰器函数
 */
export const Query = (
  property?: string,
): ((target: any, propertyName: string, index: number) => void) => {
  return createParamMapping(RouteParamTypes.QUERY)(property);
};

// export const Body = (property?: string) =>
//   createParamMapping(RouteParamTypes.BODY)(property);
// export const Session = (property?: string) =>
//   createParamMapping(RouteParamTypes.SESSION)(property);
// export const Param = (property?: string) =>
//   createParamMapping(RouteParamTypes.PARAM)(property);
// export const Headers = (property?: string) =>
//   createParamMapping(RouteParamTypes.HEADERS)(property);
// export const File = (property?: metaType.GetFileStreamOptions) =>
//   createParamMapping(RouteParamTypes.FILESTREAM)(property);
// export const Files = (property?: metaType.GetFilesStreamOptions) =>
//   createParamMapping(RouteParamTypes.FILESSTREAM)(property);
// export const RequestPath = () =>
//   createParamMapping(RouteParamTypes.REQUEST_PATH)();
// export const RequestIP = () => createParamMapping(RouteParamTypes.REQUEST_IP)();
// export const Queries = (property?: string) =>
//   createParamMapping(RouteParamTypes.QUERIES)(property);
