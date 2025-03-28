import http from 'http';
import fs from 'fs';
import path from 'path';
import url from 'url';

/**
 * 启动一个 HTTP 服务器来代理本地文件
 * @param {string} root - 要代理的本地文件根目录
 * @param {number} port - 要监听的端口号
 * @returns {Object} 包含控制服务器的方法
 */
function startProxyServer(root: string, port: number) {
  let server: http.Server | null = null;
  const fileCache: { [key: string]: Buffer } = {};

  // 创建 HTTP 服务器
  server = http.createServer(
    (req: http.IncomingMessage, res: http.ServerResponse) => {
      const parsedUrl = url.parse(req.url || '', true);
      // 获取文件路径
      const filePath = path.join(root, parsedUrl.pathname || '');
      // 设置跨域头
      res.setHeader('Access-Control-Allow-Origin', '*');

      // 检查缓存中是否存在文件
      if (fileCache[filePath]) {
        res.setHeader(
          'Content-type',
          getMimeType(path.extname(filePath)) || 'text/plain',
        );
        res.end(fileCache[filePath]);
        return;
      }

      // 检查文件是否存在
      fs.exists(filePath, (exists) => {
        if (!exists) {
          res.statusCode = 404;
          res.end(`File ${filePath} not found!`);
          return;
        }

        // 读取文件并缓存
        fs.readFile(filePath, (err, data) => {
          if (err) {
            res.statusCode = 500;
            res.end(`Error getting the file: ${err}.`);
          } else {
            // 缓存文件内容
            fileCache[filePath] = data;
            // 设置适当的 Content-Type
            const ext = path.parse(filePath).ext;
            res.setHeader('Content-type', getMimeType(ext) || 'text/plain');
            res.end(data);
          }
        });
      });
    },
  );

  // 返回控制方法
  return {
    start: () => {
      return new Promise((resolve, reject) => {
        if (server) {
          // eslint-disable-next-line
          // @ts-ignore
          server.listen(port, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve({});
            }
          });
        } else {
          reject(new Error('Server not initialized'));
        }
      });
    },
    close: () => {
      return new Promise((resolve, reject) => {
        if (server) {
          server.close((err) => {
            if (err) {
              reject(err);
            } else {
              resolve({});
            }
          });
        } else {
          resolve({});
        }
      });
    },
    clearCache: () => {
      Object.keys(fileCache).forEach((key) => {
        delete fileCache[key];
      });
    },
  };
}

// 获取文件的 MIME 类型
function getMimeType(ext: string): string | undefined {
  const mimeTypes: { [key: string]: string } = {
    '.js': 'application/javascript',
    '.ts': 'application/typescript',
    '.json': 'application/json',
    '.map': 'application/json',
    '.html': 'text/html',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
  };

  return mimeTypes[ext];
}

export { startProxyServer };
