// 拿到执行路径，以及执行文件
const childPath = process.env.CHILD_CMD_PATH as string;
const childCwd = process.env.CHILD_CWD as string;
import { join, isAbsolute } from 'path';
import { CHILD_PROCESS_EXCEPTION_EXIT_CODE } from './constants';
// eslint-disable-next-line
// @ts-ignore
import inspector from 'inspector';
import { debuglog } from 'util';

function debug(msg: string): void {
  debuglog('[mwtsc]: ' + msg)(msg);
}

if (process.debugPort) {
  const debugUrl = inspector.url() as string;
  // 防止拿失败
  if (/ws/.test(debugUrl)) {
    process.send?.({
      title: 'debug-url',
      debugUrl,
    });
  }
}

// get the child process execArgs
const runArgs = process.argv.slice(2);
if (runArgs.includes('--keepalive')) {
  process.once('unhandledRejection', (err: unknown) => {
    console.error(err);
    process.exit(CHILD_PROCESS_EXCEPTION_EXIT_CODE);
  });

  process.once('uncaughtException', (err: unknown) => {
    console.error(err);
    process.exit(CHILD_PROCESS_EXCEPTION_EXIT_CODE);
  });
}

process.on('message', (data: { title: string }) => {
  if (data.title === 'server-kill') {
    debug('send SIGINT to child process');
    // eslint-disable-next-line
    // @ts-ignore
    process.emit('SIGINT');
  }
});

process.chdir(childCwd);
if (isAbsolute(childPath as string)) {
  require(childPath);
} else {
  require(join(childCwd, childPath));
}
