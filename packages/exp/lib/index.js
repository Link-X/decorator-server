"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SomeClass = exports.Test = void 0;
const decorator_1 = require("@decorator-server/decorator");
let Test = class Test {
    aaaa() {
        console.log(12344);
    }
};
__decorate([
    (0, decorator_1.Init)()
], Test.prototype, "aaaa", null);
Test = __decorate([
    (0, decorator_1.Provide)()
], Test);
exports.Test = Test;
let SomeClass = class SomeClass {
    someGetMethod(id) {
        console.log(id);
        return 'hello world';
    }
    somePostMethod(key) {
        console.log(key);
    }
};
__decorate([
    (0, decorator_1.Inject)()
], SomeClass.prototype, "useTest", void 0);
__decorate([
    (0, decorator_1.Get)('/'),
    (0, decorator_1.Get)('/main'),
    (0, decorator_1.SetHeader)({ accept: '*/*' }),
    (0, decorator_1.HttpCode)(301),
    (0, decorator_1.ContentType)('json'),
    (0, decorator_1.Redirect)('/ccc'),
    __param(0, (0, decorator_1.Query)())
], SomeClass.prototype, "someGetMethod", null);
__decorate([
    (0, decorator_1.Post)('/b'),
    __param(0, (0, decorator_1.Query)())
], SomeClass.prototype, "somePostMethod", null);
SomeClass = __decorate([
    (0, decorator_1.Provide)(),
    (0, decorator_1.Controller)('/api')
], SomeClass);
exports.SomeClass = SomeClass;
// const provideGroup = new Map();
// console.log(JSON.stringify(assemble(Test, provideGroup)));
// console.log(JSON.stringify(assemble(SomeClass, provideGroup)));
