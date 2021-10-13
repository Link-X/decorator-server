"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentType = exports.SetHeader = exports.HttpCode = exports.Redirect = void 0;
const reflect_var_1 = require("../variable/reflect-var");
const common_1 = require("./common");
const createResponseDecorator = (data) => {
    return (target, key, descriptor) => {
        (0, common_1.saveMeta)(target, data, reflect_var_1.RESPONSE, key);
        return descriptor;
    };
};
const Redirect = (url, code = 302) => {
    return createResponseDecorator({ type: reflect_var_1.WEB_RESPONSE_REDIRECT, url, code });
};
exports.Redirect = Redirect;
const HttpCode = (code) => {
    return createResponseDecorator({ type: reflect_var_1.WEB_RESPONSE_HTTP_CODE, code });
};
exports.HttpCode = HttpCode;
const SetHeader = (headerKey, value) => {
    let headerObject = {};
    if (value) {
        headerObject[headerKey] = value;
    }
    else {
        headerObject = headerKey;
    }
    return createResponseDecorator({
        type: reflect_var_1.WEB_RESPONSE_HEADER,
        setHeaders: headerObject,
    });
};
exports.SetHeader = SetHeader;
const ContentType = (contentType) => {
    return createResponseDecorator({
        type: reflect_var_1.WEB_RESPONSE_CONTENT_TYPE,
        contentType,
    });
};
exports.ContentType = ContentType;
//# sourceMappingURL=response.js.map