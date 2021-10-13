import "reflect-metadata";

import { ROUTER_PARAMS, RESPONSE, ROUTER } from "../variable/reflect-var";

export const isFunction = (val: any): boolean => {
  return typeof val === "function";
};

export const isConstructor = (val: string): boolean => {
  if (val === "constructor") {
    return true;
  }
  return false;
};

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;

/**
 * get parameter name from function
 * @param func
 */
export function getParamNames(func: any): string[] {
  const fnStr = func.toString().replace(STRIP_COMMENTS, "");
  let result = fnStr
    .slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")"))
    .split(",")
    .map((content: any) => {
      return content.trim().replace(/\s?=.*$/, "");
    });

  if (result.length === 1 && result[0] === "") {
    result = [];
  }
  return result;
}

export const mapRouter = (instance: Object): metaType.routerMetaList => {
  const prototype = Object.getPrototypeOf(instance);

  const methodsNames = Object.getOwnPropertyNames(prototype).filter((item) => !isConstructor(item) && isFunction(prototype[item]));

  const paramsMap = Reflect.getMetadata(ROUTER_PARAMS, prototype.constructor);
  const responseMap = Reflect.getMetadata(RESPONSE, prototype.constructor);
  const routerMap = Reflect.getMetadata(ROUTER, prototype.constructor);
  return methodsNames
    .map((methodName) => {
      const fn = prototype[methodName];
      const mn = methodName.toString();
      const routerItemKey = `${ROUTER}-${mn}`;
      const paramsItemKey = `${ROUTER_PARAMS}-${mn}`;
      const responseItemKey = `${RESPONSE}-${mn}`;

      const route = routerMap && routerMap.get(routerItemKey);
      const params = paramsMap && paramsMap.get(paramsItemKey);
      const response = responseMap && responseMap.get(responseItemKey);

      return {
        route,
        methodName,
        params,
        response,
        fn,
      };
    })
    .filter((v) => v.route);
};
