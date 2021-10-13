"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inject = void 0;
const savePropertyInject = (opts) => {
    let sign = opts.sign;
    if (!sign) {
    }
};
function Inject(sign) {
    return function (target, targetKey) {
        savePropertyInject({ target, targetKey, sign });
    };
}
exports.Inject = Inject;
//# sourceMappingURL=inject.js.map