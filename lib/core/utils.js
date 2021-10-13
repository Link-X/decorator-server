"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assemble = exports.mapRouter = exports.getParamNames = exports.isConstructor = exports.isFunction = void 0;
require("reflect-metadata");
const reflect_var_1 = require("../variable/reflect-var");
const isFunction = (val) => {
    return typeof val === "function";
};
exports.isFunction = isFunction;
const isConstructor = (val) => {
    if (val === "constructor") {
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
    const fnStr = func.toString().replace(STRIP_COMMENTS, "");
    let result = fnStr
        .slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")"))
        .split(",")
        .map((content) => {
        return content.trim().replace(/\s?=.*$/, "");
    });
    if (result.length === 1 && result[0] === "") {
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
    const injectObj = {};
    for (const key of inject.keys()) {
        injectObj[key.split("-")[1]] = inject.get(key);
    }
    return injectObj;
};
const provideGroup = new Map();
const assemble = (cls) => {
    const base = Reflect.getMetadata(reflect_var_1.PROVIDE_TARGET, cls);
    if (!(base && base.id)) {
        return;
    }
    const controller = Reflect.getMetadata(reflect_var_1.CONTROLLER, cls);
    const router = (0, exports.mapRouter)(cls);
    const clsMeta = {
        base,
        controller: controller && controller.get(reflect_var_1.CONTROLLER + "-CLS"),
        router,
        inject: mapInject(cls),
    };
    provideGroup.set(base.id, clsMeta);
    return clsMeta;
};
exports.assemble = assemble;
//# sourceMappingURL=utils.js.map