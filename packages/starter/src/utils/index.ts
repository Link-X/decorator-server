import path from 'path';
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
