import { forkTsc, forkRun } from './process';
import {
  parseArgs,
  debounce,
  deleteFolderRecursive,
  readJSONCFile,
  copyFilesRecursive,
  debug,
  getRelativeDir,
  triggerMessage,
  suffixMapping,
  output,
  colors,
} from './util';
import path from 'path';
import { replaceTscAliasPaths } from 'tsc-alias';
import chokidar from 'chokidar';
import fs from 'fs';
import { startProxyServer } from './proxy';
import consoleOutput from './output';
import { performance } from 'perf_hooks';

export function run(): {
  restart: () => void;
  exit: () => Promise<void>;
  onExit: (fn: () => void) => void;
} {
  const { cmdPath, tscArgs, parentArgs, childArgs } = parseArgs(process.argv);
  const cwd: string = process.cwd();

  const isCleanDirectory: boolean = parentArgs.includes('--cleanOutDir');
  const isInspect: boolean =
    parentArgs.includes('--inspect') || parentArgs.includes('--inspect-brk');

  debug(`main process running, pid = ${process.pid}`);

  if (process.env.NODE_DEBUG === 'midway:debug') {
    tscArgs.push('--preserveWatchOutput');
  }

  if (
    tscArgs.includes('--watch') &&
    !tscArgs.includes('--listEmittedFiles') &&
    !tscArgs.includes('--version')
  ) {
    tscArgs.push('--listEmittedFiles');
  }

  debug(`cwd: ${cwd}`);
  debug(`cmdPath: ${cmdPath}`);
  debug(`tscArgs: ${tscArgs}`);
  debug(`parentArgs: ${parentArgs}`);
  debug(`childArgs: ${childArgs}`);

  let sourceDir = 'src';
  let outDir = '';
  let allowJs = false;
  let tsconfig; // 这里可以根据实际情况定义更准确的类型
  let hasPaths = false;
  let tsconfigPath: string;
  let sourceRoot: string | undefined;

  const projectIndex: number = tscArgs.findIndex(
    (arg: string) => arg === '--project' || arg === '-p',
  );
  if (projectIndex !== -1) {
    const projectPath: string = tscArgs[projectIndex + 1];
    tsconfigPath = path.resolve(cwd, projectPath);
    tsconfig = readJSONCFile(tsconfigPath);
  } else {
    tsconfigPath = path.resolve(cwd, 'tsconfig.json');
    tsconfig = readJSONCFile(tsconfigPath);
  }

  if (tsconfig.options) {
    outDir = getRelativeDir(cwd, tsconfig.options.outDir);
    allowJs = tsconfig.options.allowJs;
    sourceDir = getRelativeDir(cwd, tsconfig.options.rootDir) || sourceDir;
    sourceRoot = tsconfig.options.sourceRoot;
    hasPaths = !!(
      tsconfig.options.paths && Object.keys(tsconfig.options.paths).length > 0
    );
  }

  const outDirIndex: number = tscArgs.findIndex(
    (arg: string) => arg === '--outDir',
  );
  if (outDirIndex !== -1) {
    outDir = tscArgs[outDirIndex + 1];
  }

  if (!outDir) {
    outDir = 'dist';
  }

  const baseDir: string = path.resolve(cwd, outDir);
  childArgs.push('--baseDir', baseDir);
  let proxyServer: any; // 这里可以根据实际情况定义更准确的类型

  if (
    isInspect &&
    sourceRoot &&
    /^http:\/\/(?:localhost|127\.(?:0\.0\.1|1)):\d+\/?$/.test(sourceRoot)
  ) {
    const port: number = parseInt(sourceRoot.split(':')[2]);
    if (Number.isInteger(port)) {
      proxyServer = startProxyServer(path.join(cwd, sourceDir), port);
    }
  }

  if (isCleanDirectory) {
    deleteFolderRecursive(path.resolve(cwd, outDir));
  }

  debug(`sourceDir: ${sourceDir}`);
  debug(`outDir: ${outDir}`);
  debug(`allowJs: ${allowJs}`);
  debug(`tsconfig: ${tsconfigPath}`);
  debug(`hasPaths: ${hasPaths}`);
  debug(`sourceRoot: ${sourceRoot}`);

  let runChild: any; // 这里可以根据实际情况定义更准确的类型
  const restart = debounce(async (fileChangedList?: string[]) => {
    debug(`fileChangedList: ${fileChangedList}`);
    if (fileChangedList && fileChangedList.length === 0) return;

    performance.clearMarks();
    performance.clearMeasures();

    performance.mark('kill-start');

    async function aliasReplace() {
      if (hasPaths) {
        await replaceTscAliasPaths({
          configFile: tsconfigPath,
          outDir,
        });
      }
      if (fileChangedList) {
        output(
          `${fileChangedList.length} ${colors.dim('Files has been changed.')}`,
          true,
        );
      }
    }

    await Promise.all([runChild && runChild.kill(), aliasReplace()]);
    performance.mark('kill-end');
    const killMeasureName: string = hasPaths
      ? 'Kill & Alias Replace'
      : 'Process Kill';
    performance.measure(killMeasureName, 'kill-start', 'kill-end');

    if (proxyServer) {
      proxyServer.clearCache();
    }
    debug('Fork new child process');

    performance.mark('app-start');
    runChild && runChild.forkChild();
  }, 1000);

  function runAfterTsc() {
    if (hasPaths) {
      replaceTscAliasPaths({
        configFile: tsconfigPath,
        outDir,
      });
    }
    copyFilesRecursive(
      path.join(cwd, sourceDir),
      path.join(cwd, outDir),
      allowJs,
    );
  }

  function cleanOutDirAndRestart(p: string) {
    let changedCnt = 0;
    for (const pa of suffixMapping(p)) {
      const distPath: string = path.join(cwd, outDir, pa);
      if (!fs.existsSync(distPath)) continue;
      const stat = fs.statSync(distPath);
      changedCnt++;
      if (stat.isFile()) {
        fs.unlinkSync(distPath);
      } else {
        deleteFolderRecursive(distPath);
      }
    }

    if (changedCnt) {
      runAfterTsc();
      restart();
    }
  }

  let fileDeleteWatcher: any; // 这里可以根据实际情况定义更准确的类型
  function watchDeleteFile() {
    if (fileDeleteWatcher) return;
    const sourceAbsoluteDir: string = path.join(cwd, sourceDir);
    fileDeleteWatcher = chokidar
      .watch(sourceAbsoluteDir, {
        cwd: sourceAbsoluteDir,
      })
      .on('all', (event: string, path: string) => {
        if (event === 'unlink' || event === 'unlinkDir') {
          cleanOutDirAndRestart(path);
        }
      });
  }

  const perfStats: { name: string; duration: number }[] = [];
  let restartPerfStats: { name: string; duration: number }[] = [];

  const isPerfInit: boolean = childArgs.includes('--perf-init');

  performance.mark('tsc-start');
  const child = forkTsc(tscArgs, {
    cwd,
    onFirstWatchCompileSuccess: () => {
      performance.mark('tsc-end');
      performance.measure('TSC Compilation', 'tsc-start', 'tsc-end');
      const tscMeasure = performance.getEntriesByName('TSC Compilation')[0];
      perfStats.push({
        name: 'TSC Compilation',
        duration: tscMeasure.duration,
      });

      performance.mark('post-start');
      runAfterTsc();
      performance.mark('post-end');
      performance.measure('Post Processing', 'post-start', 'post-end');
      const postMeasure = performance.getEntriesByName('Post Processing')[0];
      perfStats.push({
        name: hasPaths ? 'Alias Replace & Copy' : 'File Copy',
        duration: postMeasure.duration,
      });

      watchDeleteFile();

      performance.mark('app-start');
      runChild = forkRun(
        path.join(__dirname, '../', '/koa-install'),
        childArgs,
        {
          cwd,
          parentArgs,
        },
      );

      runChild.onServerReady(
        async (
          serverReportOption: any,
          isFirstCallback: boolean,
          during: number,
          debugUrl: string,
        ) => {
          if (isFirstCallback) {
            performance.mark('app-end');
            performance.measure('App Startup', 'app-start', 'app-end');
            const appMeasure = performance.getEntriesByName('App Startup')[0];
            perfStats.push({
              name: 'App Startup',
              duration: appMeasure.duration,
            });

            consoleOutput.renderServerFirstReady(
              serverReportOption,
              during,
              hasPaths,
              debugUrl,
            );

            if (isPerfInit) {
              consoleOutput.renderPerfStats(perfStats);
            }

            if (proxyServer) {
              proxyServer.start();
            }
            triggerMessage('server-first-ready');
          } else {
            performance.mark('app-end');
            performance.measure('App Restart', 'app-start', 'app-end');

            consoleOutput.renderServerReady(during, debugUrl);
            if (isPerfInit) {
              const measures = performance.getEntriesByType('measure');
              const killMeasureName = hasPaths
                ? 'Kill & Alias Replace'
                : 'Process Kill';
              const killMeasure = measures.find(
                (m) => m.name === killMeasureName,
              );
              const appMeasure = measures.find((m) => m.name === 'App Restart');

              restartPerfStats = [
                {
                  name: killMeasureName,
                  duration: killMeasure ? killMeasure.duration : 0,
                },
                {
                  name: 'App Restart',
                  duration: appMeasure ? appMeasure.duration : 0,
                },
              ];
              consoleOutput.renderPerfStats(restartPerfStats);
            }

            triggerMessage('server-ready');
          }
        },
      );
      debug('watch compile success first');
      triggerMessage('watch-compile-success-first');
    },
    onWatchCompileSuccess: (fileChangedList: string[]) => {
      debug('watch compile success');
      triggerMessage('watch-compile-success');
      restart(fileChangedList);
    },
    onWatchCompileFail: () => {
      debug('watch compile fail');
      triggerMessage('watch-compile-fail');
      watchDeleteFile();
      restart.clear();
    },
    onCompileSuccess: () => {
      debug('compile success');
      triggerMessage('compile-success');
      runAfterTsc();
    },
  });
  let customFn = () => {
    console.log('123');
  };
  const onExitHandler = async () => {
    await customFn();
  };

  function onSignal() {
    output(
      `\n${colors.green('Node.js server')} ${colors.dim(
        `will exit, and please wait patiently.`,
      )}`,
    );
    output(
      `${colors.dim(
        `You can shorten the waiting time by adjusting the `,
      )}${colors.cyan('--kill-timeout')}${colors.dim(` parameter.`)}`,
    );
    try {
      restart.clear();
      return Promise.all([
        child.kill(),
        runChild && runChild.kill(),
        proxyServer && proxyServer.close(),
        fileDeleteWatcher && fileDeleteWatcher.close(),
      ]).then(() => {
        onExitHandler().then(() => {
          process.exit(0);
        });
      });
    } catch (err) {
      console.error(err);
      return onExitHandler().then(() => {
        process.exit(1);
      });
    }
  }

  process.once('SIGINT', () => {
    onSignal().catch(console.error);
  });
  process.once('SIGQUIT', () => {
    onSignal().catch(console.error);
  });
  process.once('SIGTERM', () => {
    onSignal().catch(console.error);
  });

  return {
    restart,
    exit: onSignal,
    onExit: (fn: () => void) => {
      customFn = fn;
    },
  };
}
