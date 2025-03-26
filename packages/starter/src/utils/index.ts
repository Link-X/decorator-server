import path from 'path';
import net from 'net';
import { walk } from '@root/walk';
import { address as getIPAddress } from 'ip';

// 定义固定的备选端口列表
const ALTERNATIVE_PORTS: number[] = [
  9003, 9024, 8623, 9910, 6781, 8230, 7234, 5082, 4901, 6582, 4346,
];

// 循环遍历目录
export const loopDir = async (
  url: string,
  cb: (cbPath: string, name: string, isDir: boolean) => void,
): Promise<void> => {
  try {
    await walk(
      url,
      async (
        err: Error | null,
        pathname: string,
        dirent: { name: string; isDirectory: () => boolean },
      ) => {
        if (err) {
          throw err;
        }
        const dirPath = path.dirname(pathname);
        const { name } = dirent;
        const isDir = dirent.isDirectory();
        // 过滤掉 .d.ts 文件
        if (name.includes('.d.ts')) {
          return;
        }
        cb(dirPath, name, isDir);
      },
    );
  } catch (error) {
    console.error('遍历目录时出现错误:', error);
  }
};


// 获取本地 IP 地址
export const getLocalIP = (): string => {
  try {
    return getIPAddress();
  } catch (error) {
    console.error('获取本地 IP 地址时出现错误:', error);
    return '';
  }
};

// 检测端口是否被占用
export const portIsOccupied = async (initialPort: number): Promise<number> => {
  const portQueue: number[] = [initialPort, ...ALTERNATIVE_PORTS];

  for (const port of portQueue) {
    try {
      await new Promise((resolve, reject) => {
        const server = net.createServer();
        server.on('error', (err: NodeJS.ErrnoException) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`端口 ${port} 已被占用，尝试下一个端口`);
            resolve(port);
          } else {
            reject(err);
          }
        });
        server.on('listening', () => {
          server.close(() => {
            resolve(port);
          });
        });
        server.listen(port);
      });
      return port;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EADDRINUSE') {
        throw error;
      }
    }
  }
  throw new Error('没有可用的端口，请手动指定一个可用端口');
};

// 获取命令行参数
export const getArg = (): Record<string, string | boolean> => {
  const result: Record<string, string | boolean> = {};
  process.argv.slice(2).forEach((arg) => {
    const [key, value] = arg.split('=');
    const cleanKey = key.replace('--', '');
    result[cleanKey] = value === undefined ? true : value;
  });
  return result;
};
