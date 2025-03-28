import { existsSync, readdirSync, statSync } from 'fs';
import { resolve, sep, posix } from 'path';
// eslint-disable-next-line
// @ts-ignore
const pm = require('picomatch');
// import * as pm from 'picomatch';
import * as os from 'os';


function formatWindowsPath(paths?: string[]) {
  if (os.platform() === 'win32' && paths) {
    return paths.map((p) => p.split(sep).join(posix.sep));
  }
  return paths;
}

export interface RunOptions {
  cwd: string;
  ignore?: string[];
}

export const run = (
  pattern: string[],
  options: RunOptions = { cwd: process.cwd(), ignore: [] },
) => {
  const entryDir = options.cwd;
  pattern = formatWindowsPath(pattern) || [];
  const isMatch = pm(pattern, {
    ignore: formatWindowsPath(options.ignore) || [],
  });
  const ignoreMatch = pm('**', {
    ignore: formatWindowsPath(options.ignore) || [],
  });

  function globDirectory(dirname: string, isMatch: any, ignoreDirMatch: any, options?: any) {
    if (!existsSync(dirname)) {
      return [];
    }
    const list = readdirSync(dirname);
    const result = [];

    for (const file of list) {
      const resolvePath = resolve(dirname, file);
      const fileStat = statSync(resolvePath);
      if (
        fileStat.isDirectory() &&
        ignoreDirMatch(resolvePath.replace(entryDir, ''))
      ) {
        const childs: any = globDirectory(
          resolvePath,
          isMatch,
          ignoreDirMatch,
          options,
        );
        result.push(...childs);
      } else if (
        fileStat.isFile() &&
        isMatch(resolvePath.replace(entryDir, ''))
      ) {
        result.push(resolvePath);
      }
    }

    return result;
  }

  const result = globDirectory(entryDir, isMatch, ignoreMatch, options);
  return result;
};
