"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPromise = exports.isObject = exports.isClass = exports.assemble = exports.mapRouter = exports.getParamNames = exports.isConstructor = exports.isFunction = void 0;
require("reflect-metadata");
const reflect_var_1 = require("../variable/reflect-var");
const isFunction = (val) => {
    return typeof val === 'function';
};
exports.isFunction = isFunction;
const isConstructor = (val) => {
    if (val === 'constructor') {
        return true;
    }
    return false;
};
exports.isConstructor = isConstructor;
const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
/**
 * get parameter name from function
 * @param func
 */
function getParamNames(func) {
    const fnStr = func.toString().replace(STRIP_COMMENTS, '');
    let result = fnStr
        .slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')'))
        .split(',')
        .map((content) => {
        return content.trim().replace(/\s?=.*$/, '');
    });
    if (result.length === 1 && result[0] === '') {
        result = [];
    }
    return result;
}
exports.getParamNames = getParamNames;
const mapRouter = (instance) => {
    const prototype = instance.prototype;
    const methodsNames = Object.getOwnPropertyNames(prototype).filter((item) => !(0, exports.isConstructor)(item) && (0, exports.isFunction)(prototype[item]));
    const paramsMap = Reflect.getMetadata(reflect_var_1.ROUTER_PARAMS, prototype.constructor);
    const responseMap = Reflect.getMetadata(reflect_var_1.RESPONSE, prototype.constructor);
    const routerMap = Reflect.getMetadata(reflect_var_1.ROUTER, prototype.constructor);
    return methodsNames
        .map((methodName) => {
        const mn = methodName.toString();
        const routerItemKey = `${reflect_var_1.ROUTER}-${mn}`;
        const paramsItemKey = `${reflect_var_1.ROUTER_PARAMS}-${mn}`;
        const responseItemKey = `${reflect_var_1.RESPONSE}-${mn}`;
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
exports.mapRouter = mapRouter;
const mapInject = (cls) => {
    const inject = Reflect.getMetadata(reflect_var_1.INJECT_TARGET, cls);
    if (!inject)
        return;
    const injectObj = {};
    for (const key of inject.keys()) {
        injectObj[key.split('-')[1]] = inject.get(key);
    }
    return injectObj;
};
const getBase = (cls) => {
    return Reflect.getMetadata(reflect_var_1.PROVIDE_TARGET, cls);
};
const getController = (cls) => {
    const controller = Reflect.getMetadata(reflect_var_1.CONTROLLER, cls);
    return controller && controller.get(reflect_var_1.CONTROLLER + '-CLS');
};
const getObjectDef = (cls) => {
    return Reflect.getMetadata(reflect_var_1.OBJ_DEF_CLS, cls);
};
const assemble = (cls) => {
    const base = getBase(cls);
    if (!(base && base.id)) {
        return;
    }
    return {
        base,
        controller: getController(cls),
        router: (0, exports.mapRouter)(cls),
        inject: mapInject(cls),
        objectDef: getObjectDef(cls),
    };
};
exports.assemble = assemble;
const ToString = Function.prototype.toString;
function fnBody(fn) {
    return ToString.call(fn)
        .replace(/^[^{]*{\s*/, '')
        .replace(/\s*}[^}]*$/, '');
}
function isClass(fn) {
    if (typeof fn !== 'function') {
        return false;
    }
    if (/^class[\s{]/.test(ToString.call(fn))) {
        return true;
    }
    // babel.js classCallCheck() & inlined
    const body = fnBody(fn);
    return (/classCallCheck\(/.test(body) ||
        /TypeError\("Cannot call a class as a function"\)/.test(body));
}
exports.isClass = isClass;
const isObject = (val) => {
    return val != null && typeof val === 'object' && Array.isArray(val) === false;
};
exports.isObject = isObject;
const isPromise = (val) => {
    return (0, exports.isObject)(val) && (0, exports.isFunction)(val.then) && (0, exports.isFunction)(val.catch);
};
exports.isPromise = isPromise;
