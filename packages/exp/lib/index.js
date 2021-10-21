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
const decorator_1 = require("@decorator-server/decorator");
const a_1 = require("./test/a");
let Test = class Test {
    constructor() {
        this.a = 3;
    }
    aaaa() {
        console.log(12344);
    }
};
__decorate([
    (0, decorator_1.Init)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Test.prototype, "aaaa", null);
Test = __decorate([
    (0, decorator_1.Provide)()
], Test);
exports.Test = Test;
let SomeClass = class SomeClass {
    async someGetMethod() {
        const awaitFunc = () => {
            return new Promise((res) => {
                setTimeout(() => res('3s -- redirect'), 3000);
            });
        };
        return await awaitFunc();
    }
    async redirectPath() {
        return 'hello world /redirect';
    }
    somePostMethod(key) {
        console.log(key);
        return { a: 1, b: 3 };
    }
};
__decorate([
    (0, decorator_1.Inject)(),
    __metadata("design:type", Test)
], SomeClass.prototype, "useTest", void 0);
__decorate([
    (0, decorator_1.Inject)(),
    __metadata("design:type", a_1.first)
], SomeClass.prototype, "first", void 0);
__decorate([
    (0, decorator_1.Get)('/'),
    (0, decorator_1.Get)('/ccc/:id'),
    (0, decorator_1.SetHeader)({ accept: '*/*', test: 'cecece' }),
    (0, decorator_1.ContentType)('text'),
    (0, decorator_1.Redirect)('/api/redirect'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SomeClass.prototype, "someGetMethod", null);
__decorate([
    (0, decorator_1.HttpCode)(200),
    (0, decorator_1.Get)('/redirect'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SomeClass.prototype, "redirectPath", null);
__decorate([
    (0, decorator_1.Post)('/b'),
    (0, decorator_1.ContentType)('json'),
    __param(0, (0, decorator_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SomeClass.prototype, "somePostMethod", null);
SomeClass = __decorate([
    (0, decorator_1.Provide)(),
    (0, decorator_1.Controller)('/api')
], SomeClass);
exports.SomeClass = SomeClass;
// const provideGroup = new Map();
// console.log(JSON.stringify(assemble(Test, provideGroup)));
// console.log(JSON.stringify(assemble(SomeClass, provideGroup)));
