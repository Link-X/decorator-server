"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveMeta = void 0;
require("reflect-metadata");
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
//# sourceMappingURL=common.js.map