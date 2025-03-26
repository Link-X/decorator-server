import { spawn, fork, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import { filterFileChangedText, convertPosixToGnu } from './utils';

// import koaInstall from './koa-install';

const CHILD_PROCESS_EXCEPTION_EXIT_CODE = 10;
// is windows
const isWin = process.platform === 'win32';

export const forkRun = (
  runCmdPath: string,
  runArgs = [] as string[],
  options = {} as any,
) => {
  // 判断路径是否是包名还是路径
  if (!runCmdPath.startsWith('.') && !runCmdPath.startsWith('/')) {
    runCmdPath = require.resolve(runCmdPath, {
      paths: [options.cwd || process.cwd()],
    });
  }
  let runChild: ChildProcess;
  let onServerReadyCallback: any;
  /**
   * 记录上一次启动状态, undefined 代表未启动
   * 有可能自定义启动入口不会触发 server-ready
   * 只在 --keepalive 下有效
   */
  let lastBootstrapStatus: any = undefined;

  // 先将所有 parentArgs 转换为 GNU 格式
  const gnuStyleParentArgs = convertPosixToGnu(options.parentArgs || []);

  // 从 options.parentArgs 中获取需要的 execArgv，parentArgs 是 POSIX 风格，需要过滤后转成 GNU 风格
  const filterExecArgv = ['--inspect', '--inspect-brk'];

  // 过滤出需要的参数
  const requiredExecArgv = gnuStyleParentArgs.filter((arg) =>
    filterExecArgv.some((filterArg) => arg.startsWith(filterArg)),
  );

  const isPerfInit = runArgs.includes('--perf-init');

  function innerFork(isFirstFork = false) {
    const startTime = Date.now();

    // 准备 execArgv
    const execArgv = process.execArgv
      .concat(['-r', 'source-map-support/register'])
      .concat(requiredExecArgv);

    runChild = fork('wrap.js', runArgs, {
      stdio: 'inherit',
      cwd: __dirname,
      env: {
        CHILD_CMD_PATH: runCmdPath,
        CHILD_CWD: options.cwd || process.cwd(),
        MWTSC_DEVELOPMENT_ENVIRONMENT: 'true',
        ...process.env,
      },
      execArgv: execArgv,
    });
    let currentDebugUrl: string;
    const onServerReady = async (data: any) => {
      try {
        if (data.title === 'server-ready') {
          onServerReadyCallback &&
            (await onServerReadyCallback(
              data,
              isFirstFork,
              Date.now() - startTime,
              currentDebugUrl,
            ));
          lastBootstrapStatus = true;
        } else if (data.title === 'debug-url') {
          currentDebugUrl = data.debugUrl;
        } else if (data.title === 'perf-init') {
          if (isPerfInit) {
            // perf init
            console.log(data.data);
          }
        }
      } catch (err) {
        console.error(err);
        lastBootstrapStatus = false;
      }
    };
    runChild.on('message', onServerReady);
    if (runArgs.includes('--keepalive')) {
      runChild.once('exit', (code) => {
        if (code === CHILD_PROCESS_EXCEPTION_EXIT_CODE) {
          console.log('renderKeepAlive');
          if (lastBootstrapStatus === undefined || lastBootstrapStatus) {
            // 只有上一次启动成功了，才继续保活拉起，如果启动就失败了，就停止重启
            innerFork(false);
          }
        } else if (code !== 0) {
          lastBootstrapStatus = false;
        }
      });
    }
  }

  innerFork(true);

  // 从参数中获取超时时间，默认 2000ms
  const killTimeout = (() => {
    const index = runArgs.indexOf('--kill-timeout');
    if (index !== -1 && runArgs[index + 1]) {
      const timeout = parseInt(runArgs[index + 1], 10);
      return isNaN(timeout) ? 2000 : timeout;
    }
    return 2000;
  })();

  const killRunningChild = async () => {
    if (!runChild || runChild.exitCode !== null) {
      // 进程已退出
      console.log('child process already exited');
      return;
    }

    return new Promise((resolve) => {
      const now = Date.now();
      console.log(`send SIGINT to child process ${runChild.pid}`);
      // 发送退出消息给子进程
      runChild.send({
        title: 'server-kill',
      });

      // 设置超时处理
      const timeoutHandle = setTimeout(() => {
        try {
          // 超时后强制结束进程
          console.log(
            `send SIGKILL to child process ${runChild.pid} +${
              Date.now() - now
            }ms`,
          );
          runChild.kill('SIGKILL');
        } catch (err) {
          console.log(
            `send SIGKILL to child process error, msg = ${err.message}, pid = ${runChild.pid}`,
          );
        }
      }, killTimeout);

      // 监听进程退出
      runChild.once('exit', () => {
        console.log(
          `child process ${runChild.pid} exited +${Date.now() - now}ms`,
        );
        clearTimeout(timeoutHandle);
        resolve({});
      });
    });
  };

  return {
    async kill() {
      console.log('kill');
      await killRunningChild();
    },
    async restart() {
      // 杀进程
      await killRunningChild();
      // 重新拉起来
      innerFork(false);
    },
    forkChild() {
      innerFork(false);
    },
    onServerReady(readyCallback: any) {
      onServerReadyCallback = readyCallback;
    },
    getRealChild() {
      return runChild;
    },
  };
};

export const forkTsc = (tscArgs = [] as any[], options = {} as any) => {
  let tscPath = isWin ? 'tsc.cmd' : 'tsc';

  const localTscPath = path.join(
    process.cwd(),
    'node_modules',
    '.bin',
    tscPath,
  );
  if (fs.existsSync(localTscPath)) {
    tscPath = localTscPath;
  }
  let firstStarted = false;
  const totalFileChangedList = new Set();

  const isWatchMode = tscArgs.includes('--watch');
  const child = spawn(tscPath, tscArgs, {
    stdio: ['pipe', 'pipe', 'inherit'],
    cwd: options.cwd,
    shell: isWin ? true : undefined,
  });

  child.stdout.on('data', (data: any) => {
    data = data.toString('utf8');
    console.log(data, '--data--');
    if (!isWatchMode) {
      console.log(data);
      return;
    }
    const [text, fileChangedList] = filterFileChangedText(data);
    if (fileChangedList.length) {
      for (const file of fileChangedList) {
        totalFileChangedList.add(file);
      }
    }

    if (/TS\d{4,5}/.test(text)) {
      // has error
      console.log(text);
      // 如果已经启动了，则传递成功消息给子进程
      options.onWatchCompileFail && options.onWatchCompileFail();
      // 失败后清空
      totalFileChangedList.clear();
    } else {
      console.log(text);
      /**
       * 为了减少 tsc 误判，最后一条输出会带有错误信息的数字提示，所以使用正则来简单判断
       * 如果 tsc 改了，这里也要改
       */
      if (/\s\d+\s/.test(text) && /\s0\s/.test(text)) {
        if (!firstStarted) {
          firstStarted = true;
          // emit start
          options.onFirstWatchCompileSuccess &&
            options.onFirstWatchCompileSuccess();
        } else {
          // 如果已经启动了，则传递成功消息给子进程
          options.onWatchCompileSuccess &&
            options.onWatchCompileSuccess(Array.from(totalFileChangedList));
        }
        // 传递后清空
        totalFileChangedList.clear();
      }
    }
  });

  child.on('exit', (code: number) => {
    if (code === 0) {
      options.onCompileSuccess && options.onCompileSuccess();
    }
  });
  // 当子进程的stdio流关闭时会触发close事件
  child.on('close', (code: number, signal: string) => {
    console.log(`子进程已关闭，退出码：${code}，信号：${signal}`);
  });

  return child;
};
