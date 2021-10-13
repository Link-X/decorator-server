"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SomeClass = exports.Test = void 0;
const index_1 = require("../index");
const utils_1 = require("../core/utils");
let Test = class Test {
    aaaa() {
        console.log(12344);
    }
};
__decorate([
    (0, index_1.Init)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Test.prototype, "aaaa", null);
Test = __decorate([
    (0, index_1.Provide)()
], Test);
exports.Test = Test;
let SomeClass = class SomeClass {
    someGetMethod(id) {
        console.log(id);
        return "hello world";
    }
    somePostMethod(key) {
        console.log(key);
    }
};
__decorate([
    (0, index_1.Inject)(),
    __metadata("design:type", Test)
], SomeClass.prototype, "useTest", void 0);
__decorate([
    (0, index_1.Get)("/"),
    (0, index_1.Get)("/main"),
    (0, index_1.SetHeader)({ accept: "*/*" }),
    (0, index_1.HttpCode)(301),
    (0, index_1.ContentType)("json"),
    (0, index_1.Redirect)("/ccc"),
    __param(0, (0, index_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SomeClass.prototype, "someGetMethod", null);
__decorate([
    (0, index_1.Post)("/b"),
    __param(0, (0, index_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SomeClass.prototype, "somePostMethod", null);
SomeClass = __decorate([
    (0, index_1.Provide)(),
    (0, index_1.Controller)("/api")
], SomeClass);
exports.SomeClass = SomeClass;
console.log(JSON.stringify((0, utils_1.assemble)(Test)));
console.log(JSON.stringify((0, utils_1.assemble)(SomeClass)));
//# sourceMappingURL=index.js.map