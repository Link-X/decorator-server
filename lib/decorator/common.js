"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveObjectDefProps = exports.saveMeta = void 0;
require("reflect-metadata");
const reflect_var_1 = require("../variable/reflect-var");
const saveMeta = (target, data, metaKey, propertyName) => {
    const dataKey = `${metaKey}-${propertyName.toString()}`;
    if (typeof target === "object" && target.constructor) {
        target = target.constructor;
    }
    let m;
    if (Reflect.hasOwnMetadata(metaKey, target)) {
        m = Reflect.getMetadata(metaKey, target);
    }
    else {
        m = new Map();
    }
    if (!m.has(dataKey)) {
        m.set(dataKey, []);
    }
    m.get(dataKey).push(data);
    Reflect.defineMetadata(metaKey, m, target);
};
exports.saveMeta = saveMeta;
function saveObjectDefProps(target, props = {}) {
    if (typeof target === "object" && target.constructor) {
        target = target.constructor;
    }
    if (Reflect.hasMetadata(reflect_var_1.OBJ_DEF_CLS, target)) {
        const originProps = Reflect.getMetadata(reflect_var_1.OBJ_DEF_CLS, target);
        Reflect.defineMetadata(reflect_var_1.OBJ_DEF_CLS, Object.assign(originProps, props), target);
    }
    else {
        Reflect.defineMetadata(reflect_var_1.OBJ_DEF_CLS, props, target);
    }
    return target;
}
exports.saveObjectDefProps = saveObjectDefProps;
//# sourceMappingURL=common.js.map