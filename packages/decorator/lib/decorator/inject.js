"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inject = exports.isClass = void 0;
const reflect_var_1 = require("../variable/reflect-var");
const common_1 = require("./common");
const ToString = Function.prototype.toString;
function fnBody(fn) {
    return ToString.call(fn)
        .replace(/^[^{]*{\s*/, "")
        .replace(/\s*}[^}]*$/, "");
}
function isClass(fn) {
    if (typeof fn !== "function") {
        return false;
    }
    if (/^class[\s{]/.test(ToString.call(fn))) {
        return true;
    }
    // babel.js classCallCheck() & inlined
    const body = fnBody(fn);
    return /classCallCheck\(/.test(body) || /TypeError\("Cannot call a class as a function"\)/.test(body);
}
exports.isClass = isClass;
const savePropertyInject = (opts) => {
    const { targetKey, target } = opts;
    const propertyType = Reflect.getMetadata("design:type", target, targetKey);
    if (isClass(propertyType)) {
        (0, common_1.saveMeta)(target, { value: targetKey, key: "inject", injectVal: propertyType.name }, reflect_var_1.INJECT_TARGET, targetKey);
    }
    else {
        console.log('inject 只允许注入class');
    }
};
function Inject() {
    return function (target, targetKey, index) {
        if (typeof index === "number") {
        }
        else {
            savePropertyInject({ target, targetKey });
        }
    };
}
exports.Inject = Inject;
