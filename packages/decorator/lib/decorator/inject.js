"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inject = void 0;
const reflect_var_1 = require("../variable/reflect-var");
const common_1 = require("./common");
const utils_1 = require("../core/utils");
const savePropertyInject = (opts) => {
    const { targetKey, target } = opts;
    const propertyType = Reflect.getMetadata('design:type', target, targetKey);
    if ((0, utils_1.isClass)(propertyType)) {
        (0, common_1.saveMeta)(target, { value: targetKey, key: 'inject', injectVal: propertyType.name }, reflect_var_1.INJECT_TARGET, targetKey);
    }
    else {
        (0, common_1.saveMeta)(target, { value: targetKey, key: 'inject', injectVal: targetKey }, reflect_var_1.INJECT_TARGET, targetKey);
    }
};
function Inject(key) {
    return function (target, targetKey, index) {
        if (key) {
            console.log(key);
        }
        if (typeof index === 'number') {
        }
        else {
            savePropertyInject({ target, targetKey });
        }
    };
}
exports.Inject = Inject;
