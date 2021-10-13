"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queries = exports.RequestIP = exports.RequestPath = exports.Files = exports.File = exports.Headers = exports.Param = exports.Session = exports.Body = exports.Query = exports.RouteParamTypes = void 0;
const utils_1 = require("../core/utils");
const reflect_var_1 = require("../variable/reflect-var");
const common_1 = require("./common");
var RouteParamTypes;
(function (RouteParamTypes) {
    RouteParamTypes[RouteParamTypes["QUERY"] = 0] = "QUERY";
    RouteParamTypes[RouteParamTypes["BODY"] = 1] = "BODY";
    RouteParamTypes[RouteParamTypes["PARAM"] = 2] = "PARAM";
    RouteParamTypes[RouteParamTypes["HEADERS"] = 3] = "HEADERS";
    RouteParamTypes[RouteParamTypes["SESSION"] = 4] = "SESSION";
    RouteParamTypes[RouteParamTypes["FILESTREAM"] = 5] = "FILESTREAM";
    RouteParamTypes[RouteParamTypes["FILESSTREAM"] = 6] = "FILESSTREAM";
    RouteParamTypes[RouteParamTypes["NEXT"] = 7] = "NEXT";
    RouteParamTypes[RouteParamTypes["REQUEST_PATH"] = 8] = "REQUEST_PATH";
    RouteParamTypes[RouteParamTypes["REQUEST_IP"] = 9] = "REQUEST_IP";
    RouteParamTypes[RouteParamTypes["QUERIES"] = 10] = "QUERIES";
})(RouteParamTypes = exports.RouteParamTypes || (exports.RouteParamTypes = {}));
const createParamMapping = (type) => {
    return (propertyData) => (target, propertyName, index) => {
        if (propertyData === undefined) {
            propertyData = (0, utils_1.getParamNames)(target[propertyName])[index];
        }
        (0, common_1.saveMeta)(target, {
            index,
            type,
            propertyData,
        }, reflect_var_1.ROUTER_PARAMS, propertyName);
    };
};
const Query = (property) => createParamMapping(RouteParamTypes.QUERY)(property);
exports.Query = Query;
const Body = (property) => createParamMapping(RouteParamTypes.BODY)(property);
exports.Body = Body;
const Session = (property) => createParamMapping(RouteParamTypes.SESSION)(property);
exports.Session = Session;
const Param = (property) => createParamMapping(RouteParamTypes.PARAM)(property);
exports.Param = Param;
const Headers = (property) => createParamMapping(RouteParamTypes.HEADERS)(property);
exports.Headers = Headers;
const File = (property) => createParamMapping(RouteParamTypes.FILESTREAM)(property);
exports.File = File;
const Files = (property) => createParamMapping(RouteParamTypes.FILESSTREAM)(property);
exports.Files = Files;
const RequestPath = () => createParamMapping(RouteParamTypes.REQUEST_PATH)();
exports.RequestPath = RequestPath;
const RequestIP = () => createParamMapping(RouteParamTypes.REQUEST_IP)();
exports.RequestIP = RequestIP;
const Queries = (property) => createParamMapping(RouteParamTypes.QUERIES)(property);
exports.Queries = Queries;
//# sourceMappingURL=paramsMapping.js.map