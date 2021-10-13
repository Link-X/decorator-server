import "reflect-metadata";

import { ROUTER_PARAMS, RESPONSE, ROUTER, CONTROLLER, PROVIDE_TARGET, INJECT_TARGET } from "../variable/reflect-var";

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

export const mapRouter = (instance: any): metaType.routerMetaList => {
  const prototype = instance.prototype;

  const methodsNames = Object.getOwnPropertyNames(prototype).filter((item) => !isConstructor(item) && isFunction(prototype[item]));

  const paramsMap = Reflect.getMetadata(ROUTER_PARAMS, prototype.constructor);
  const responseMap = Reflect.getMetadata(RESPONSE, prototype.constructor);
  const routerMap = Reflect.getMetadata(ROUTER, prototype.constructor);
  return methodsNames
    .map((methodName) => {
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
      };
    })
    .filter((v) => v.route);
};

const mapInject = (cls: any): any => {
  const inject = Reflect.getMetadata(INJECT_TARGET, cls);
  const injectObj: any = {};
  for (const key of inject.keys()) {
    injectObj[key.split("-")[1]] = inject.get(key);
  }
  return injectObj;
};

const provideGroup = new Map();

export const assemble = (cls: any) => {
  const base = Reflect.getMetadata(PROVIDE_TARGET, cls);
  if (!(base && base.id)) {
    return;
  }
  const controller = Reflect.getMetadata(CONTROLLER, cls);

  const router = mapRouter(cls);
  const clsMeta = {
    base,
    controller: controller.get(CONTROLLER + "-CLS"),
    router,
    inject: mapInject(cls),
  };
  provideGroup.set(base.id, clsMeta);
  return clsMeta;
};
