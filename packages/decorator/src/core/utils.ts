import 'reflect-metadata';

import {
  ROUTER_PARAMS,
  RESPONSE,
  ROUTER,
  CONTROLLER,
  PROVIDE_TARGET,
  INJECT_TARGET,
  OBJ_DEF_CLS,
} from '../variable/reflect-var';

export const isFunction = (val: any): boolean => {
  return typeof val === 'function';
};

export const isConstructor = (val: string): boolean => {
  if (val === 'constructor') {
    return true;
  }
  return false;
};

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;

/**
 * 获取类型名字
 */
export function getParamNames(func: any): string[] {
  const fnStr = func.toString().replace(STRIP_COMMENTS, '');
  let result = fnStr
    .slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')'))
    .split(',')
    .map((content: any) => {
      return content.trim().replace(/\s?=.*$/, '');
    });

  if (result.length === 1 && result[0] === '') {
    result = [];
  }
  return result;
}

/** 解析router 装饰器的元数据 */
export const mapRouter = (instance: any): metaType.routerMetaList => {
  const prototype = instance.prototype;

  const methodsNames = Object.getOwnPropertyNames(prototype).filter(
    (item) => !isConstructor(item) && isFunction(prototype[item]),
  );

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
  if (!inject) return;
  const injectObj: any = {};
  for (const key of inject.keys()) {
    injectObj[key.split('-')[1]] = inject.get(key);
  }
  return injectObj;
};

const getBase = (cls: any) => {
  return Reflect.getMetadata(PROVIDE_TARGET, cls);
};

const getController = (cls: any) => {
  const controller = Reflect.getMetadata(CONTROLLER, cls);
  return controller && controller.get(CONTROLLER + '-CLS');
};

const getObjectDef = (cls: any) => {
  return Reflect.getMetadata(OBJ_DEF_CLS, cls);
};

/** 解析class的元数据 */
export const assemble = (cls: any) => {
  const base = getBase(cls);
  if (!(base && base.id)) {
    return;
  }
  return {
    base,
    controller: getController(cls),
    router: mapRouter(cls),
    inject: mapInject(cls),
    objectDef: getObjectDef(cls),
  };
};

const ToString = Function.prototype.toString;

function fnBody(fn: any) {
  return ToString.call(fn)
    .replace(/^[^{]*{\s*/, '')
    .replace(/\s*}[^}]*$/, '');
}

export function isClass(fn: any) {
  if (typeof fn !== 'function') {
    return false;
  }

  if (/^class[\s{]/.test(ToString.call(fn))) {
    return true;
  }

  // babel.js classCallCheck() & inlined
  const body = fnBody(fn);
  return (
    /classCallCheck\(/.test(body) ||
    /TypeError\("Cannot call a class as a function"\)/.test(body)
  );
}

export const isObject = (val: any) => {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
};

export const isPromise = (val: any) => {
  if (!val) return false;
  const name = val.constructor.name;
  if (name === 'AsyncFunction' || name === 'Promise') return true;
  console.log(name,val)
};
