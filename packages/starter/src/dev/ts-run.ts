import { forkTsc, forkRun } from './process';
import { parseArgs, debounce } from './utils';
// import koaInstall from './koa-install';

export function run() {
  const { cmdPath, tscArgs, childArgs, parentArgs } = parseArgs(process.argv);
  const cwd = process.cwd();
  let runChild: any;

  // 添加 --listEmittedFiles 参数以便于获取编译后文件列表
  if (
    tscArgs.includes('--watch') &&
    !tscArgs.includes('--listEmittedFiles') &&
    !tscArgs.includes('--version')
  ) {
    tscArgs.push('--listEmittedFiles');
    tscArgs.push(['--preserveWatchOutput']);
  }

  const restart = debounce(async (fileChangedList: any[]) => {
    // TODO: 这里不知道为什么会有空数组 先注释掉
    if (fileChangedList && fileChangedList.length === 0) return;

    await Promise.all([runChild && runChild.kill()]);
    runChild && runChild.forkChild();
  }, 1000);

  const child = forkTsc(tscArgs, {
    cwd,
    onFirstWatchCompileSuccess: () => {
      runChild = forkRun(`${__dirname}/koa-install`, childArgs, {
        cwd,
        parentArgs,
      });
      console.log('onFirstWatchCompileSuccess', cmdPath);
      if (cmdPath) {
        // 3. 应用启动阶段
        // 设置一次性的 onServerReady 回调
        console.log('over');
      }
    },
    onWatchCompileSuccess: (fileChangedList: any[]) => {
      console.log('onWatchCompileSuccess');
      restart(fileChangedList);
    },
    onWatchCompileFail: () => {
      console.log('onWatchCompileFail');
      restart.clear();
    },
    onCompileSuccess: () => {
      console.log('onCompileSuccess');
    },
  });

  const customFn = () => {
    console.log('customFn');
  };
  const onExitHandler = async () => {
    await customFn();
  };
  function onSignal() {
    try {
      restart.clear();
      // 使用 Promise.all 并行执行所有清理任务
      return Promise.all([child.kill(), runChild && runChild.kill()]).then(
        () => {
          onExitHandler().then(() => {
            process.exit(0);
          });
        },
      );
    } catch (err) {
      console.error(err);
      return onExitHandler().then(() => {
        process.exit(1);
      });
    }
  }

  process.once('SIGINT', () => {
    onSignal().catch(console.error); // 不再强制退出
  });
  // kill(3) Ctrl-\
  process.once('SIGQUIT', () => {
    onSignal().catch(console.error); // 不再强制退出
  });
  // kill(15) default
  process.once('SIGTERM', () => {
    onSignal().catch(console.error); // 不再强制退出
  });
}
