import path from 'path';
import net from 'net';
import { walk } from '@root/walk';

export const loopDir = async (
  url: string,
  cb: (cbPath: string, name: string, isDir: boolean) => void,
) => {
  await walk(
    url,
    async (
      err: any,
      pathname: string,
      dirent: { name: string; isDirectory: any },
    ) => {
      if (err) {
        throw err;
      }
      const pathUrl = path.dirname(pathname);
      const { name } = dirent;
      const isDir = dirent.isDirectory();
      if (name.includes('.d.ts')) return;
      cb(pathUrl, name, isDir);
    },
  );
};

// 检测端口是否被占用
export const portIsOccupied = async (port: number): Promise<number> => {
  const ports = [9003,9024,8623,9910,6781,8230,7234,5082,4901,6582,4346]
  const getOkPort = (port: number, res: any, rej: any) => {
    const server = net.createServer().listen(port);

    server.on('listening', function () {
      server.close();
      res(port);
    });

    server.on('error', function (err: any) {
      if (err.code === 'EADDRINUSE') {
        console.log(`${port}: 端口被占用, 正在寻找下一个可用端口`);
        if (!ports.length) return rej(new Error('不找了, 请设置一个可用端口'));
        getOkPort(ports.pop() || 6666, res, rej);
      }
    });
  };
  return new Promise(async (res, rej) => {
    getOkPort(port, res, rej);
  });
};

export const getArg = (): { [key: string]: string } => {
  const argv = process.argv.slice(2);
  const obj: { [key: string]: any } = {};
  argv.forEach((v) => {
    const arr = v.split('=');
    obj[arr[0].replace('--', '')] = arr[1] || true;
    return obj;
  });
  return obj;
};
