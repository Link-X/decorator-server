import 'reflect-metadata';

import {
  ROUTER_PARAMS,
  RESPONSE,
  ROUTER,
  CONTROLLER,
  PROVIDE_TARGET,
  INJECT_TARGET,
  OBJ_DEF_CLS,
} from '../variable/meta-name';

// 判断是否为函数
export const isFunction = (val: any): boolean => {
  return typeof val === 'function';
};

// 判断是否为构造函数
export const isConstructor = (val: string): boolean => {
  return val === 'constructor';
};

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;

// 获取函数参数名字
export function getParamNames(func: any): string[] {
  const fnStr = func.toString().replace(STRIP_COMMENTS, '');
  let result = fnStr
    .slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')'))
    .split(',')
    .map((content: string) => content.trim().replace(/\s?=.*$/, ''));

  if (result.length === 1 && result[0] === '') {
    result = [];
  }
  return result;
}

// 解析 router 装饰器的元数据
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

// 解析注入元数据
const mapInject = (cls: any): any => {
  const inject = Reflect.getMetadata(INJECT_TARGET, cls);
  if (!inject) return;
  const injectObj: any = {};
  for (const key of inject.keys()) {
    injectObj[key.split('-')[1]] = inject.get(key);
  }
  return injectObj;
};

// 获取基础元数据
const getBase = (cls: any) => {
  return Reflect.getMetadata(PROVIDE_TARGET, cls);
};

// 获取控制器元数据
const getController = (cls: any) => {
  const controller = Reflect.getMetadata(CONTROLLER, cls);
  return controller && controller.get(CONTROLLER + '-CLS');
};

// 获取对象定义元数据
const getObjectDef = (cls: any) => {
  return Reflect.getMetadata(OBJ_DEF_CLS, cls);
};

// 解析 class 的元数据
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

// 获取函数体
function fnBody(fn: any) {
  return ToString.call(fn)
    .replace(/^[^{]*{\s*/, '')
    .replace(/\s*}[^}]*$/, '');
}

// 判断是否为类
export function isClass(fn: any): boolean {
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

// 判断是否为对象
export const isObject = (val: any): boolean => {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
};

// 判断是否为 Promise 或异步函数
export const isPromise = (val: any): boolean => {
  if (!val) return false;
  const name = val.constructor.name;
  return name === 'AsyncFunction' || name === 'Promise';
};
