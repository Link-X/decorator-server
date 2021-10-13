"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Init = void 0;
const common_1 = require("./common");
const Init = () => {
    return (target, propertyKey) => {
        return (0, common_1.saveObjectDefProps)(target, { initMethod: propertyKey });
    };
};
exports.Init = Init;
