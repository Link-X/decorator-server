"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getArg = exports.portIsOccupied = exports.loopDir = void 0;
const path_1 = __importDefault(require("path"));
const net_1 = __importDefault(require("net"));
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
// 检测端口是否被占用
const portIsOccupied = async (port) => {
    const ports = [9003, 9024, 8623, 9910, 6781, 8230, 7234, 5082, 4901, 6582, 4346];
    const getOkPort = (port, res, rej) => {
        const server = net_1.default.createServer().listen(port);
        server.on('listening', function () {
            server.close();
            res(port);
        });
        server.on('error', function (err) {
            if (err.code === 'EADDRINUSE') {
                console.log(`${port}: 端口被占用, 正在寻找下一个可用端口`);
                if (!ports.length)
                    return rej(new Error('不找了, 请设置一个可用端口'));
                getOkPort(ports.pop() || 6666, res, rej);
            }
        });
    };
    return new Promise(async (res, rej) => {
        getOkPort(port, res, rej);
    });
};
exports.portIsOccupied = portIsOccupied;
const getArg = () => {
    const argv = process.argv.slice(2);
    const obj = {};
    argv.forEach((v) => {
        const arr = v.split('=');
        obj[arr[0].replace('--', '')] = arr[1] || true;
        return obj;
    });
    return obj;
};
exports.getArg = getArg;
