"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_body_1 = __importDefault(require("koa-body"));
class abc {
    query(a) {
        console.log(a, 'abc');
    }
}
class Init {
    async onReady(cn, app) {
        console.log('onready');
        app.use((0, koa_body_1.default)());
        cn.registerObject('sequelize', abc);
    }
    async onStop() {
        console.log('stop');
    }
}
exports.default = Init;
