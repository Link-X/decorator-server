"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.All = exports.Post = exports.Get = void 0;
require("reflect-metadata");
const reflect_var_1 = require("../variable/reflect-var");
const common_1 = require("./common");
const createMappingDecorator = (method) => {
    return (path, opt = { middleware: [] }) => {
        return (target, key, descriptor) => {
            (0, common_1.saveMeta)(target, {
                path,
                requestMethod: method,
                propertyName: key,
                middleware: opt.middleware,
            }, reflect_var_1.ROUTER, key);
            return descriptor;
        };
    };
};
exports.Get = createMappingDecorator('GET');
exports.Post = createMappingDecorator('POST');
exports.All = createMappingDecorator('ALL');
