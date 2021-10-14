"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loopDir = void 0;
const path_1 = __importDefault(require("path"));
const walk_1 = require("@root/walk");
const loopDir = async (url, cb) => {
    await (0, walk_1.walk)(url, async (err, pathname, dirent) => {
        if (err) {
            throw err;
        }
        const pathUrl = path_1.default.dirname(pathname);
        const { name } = dirent;
        const isDir = dirent.isDirectory();
        if (name.includes('.d.ts'))
            return;
        cb(pathUrl, name, isDir);
    });
};
exports.loopDir = loopDir;
