"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controller = void 0;
const reflect_var_1 = require("../variable/reflect-var");
const common_1 = require("./common");
const Controller = (prefix, routerOptions = { middleware: [] }) => {
    return (target) => {
        (0, common_1.saveMeta)(target, {
            prefix,
            routerOptions,
        }, reflect_var_1.CONTROLLER, "CLS");
    };
};
exports.Controller = Controller;
//# sourceMappingURL=controller.js.map