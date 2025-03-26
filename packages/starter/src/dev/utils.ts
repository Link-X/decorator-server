export const filterFileChangedText = (data: string): [string, string[]] => {
  // return [data without changed text, changedList]
  if (!data.includes('TSFILE:')) {
    return [data, []];
  }

  const lines = data.split('\n');
  const fileChangedList = [];

  let newData = '';
  for (const line of lines) {
    if (/TSFILE:/.test(line)) {
      const match = line.match(/TSFILE:\s+(.*)/);
      if (match && match[1] && !match[1].endsWith('d.ts')) {
        fileChangedList.push(match[1]);
      }
    } else {
      if (line === '' || /\n$/.test(line)) {
        newData += line;
      } else {
        newData += line + '\n';
      }
    }
  }

  return [newData, fileChangedList];
};

export const parseArgs = (argv: string[]) => {
  // 去除前两个参数（通常是 node 和脚本名）
  const args = argv.slice(2);

  const result: {
    cmdPath: string | undefined;
    tscArgs: any[];
    parentArgs: string[];
    childArgs: string[];
  } = {
    cmdPath: undefined,
    tscArgs: [],
    parentArgs: [],
    childArgs: [],
  };

  const notTscArgPrefixes = ['--cleanOutDir', '--inspect', '--inspect-brk'];

  // 将 GNU 风格的参数转换为 POSIX 风格
  const convertToPosixStyle = (args: string[]) => {
    const posixArgs = [];
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (arg.includes('=') && arg.startsWith('--')) {
        const [key, value] = arg.split('=');
        posixArgs.push(key, value);
      } else {
        posixArgs.push(arg);
      }
    }
    return posixArgs;
  };

  // 检查参数是否属于 notTscArgs
  const isNotTscArg = (arg: string) => {
    return notTscArgPrefixes.some((prefix) => arg.startsWith(prefix));
  };

  // 处理转换后的参数
  const processArgs = (args: string[]) => {
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (isNotTscArg(arg)) {
        result.parentArgs.push(arg);
        // 如果下一个参数不是以 -- 开头，认为它是当前参数的值
        if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
          result.parentArgs.push(args[i + 1]);
          i++;
        }
      } else if (
        arg.startsWith('--') &&
        i + 1 < args.length &&
        !args[i + 1].startsWith('--')
      ) {
        // 处理 key value 格式
        result.tscArgs.push(arg, args[i + 1]);
        i++; // 跳过下一个参数，因为它是当前参数的值
      } else {
        result.tscArgs.push(arg);
      }
    }
  };

  const posixArgs = convertToPosixStyle(args);
  const runIndex = posixArgs.indexOf('--run');

  if (runIndex !== -1) {
    // 提取 --run 后面的参数作为子进程参数
    result.cmdPath = posixArgs[runIndex + 1];
    result.childArgs = posixArgs.slice(runIndex + 2);

    // 处理 --run 前面的参数
    processArgs(posixArgs.slice(0, runIndex));
  } else {
    // 如果没有 --run，处理所有参数
    processArgs(posixArgs);
  }

  return result;
};

export const convertPosixToGnu = (args: string[]) => {
  const gnuArgs = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (
      arg.startsWith('--') &&
      i + 1 < args.length &&
      !args[i + 1].startsWith('--')
    ) {
      // 如果当前参数以 -- 开头，且下一个参数不以 -- 开头，则将它们合并
      gnuArgs.push(`${arg}=${args[i + 1]}`);
      i++; // 跳过下一个参数，因为已经合并了
    } else {
      gnuArgs.push(arg);
    }
  }
  return gnuArgs;
};

export const debounce = function (func: any, wait: any, immediate = false) {
  let timeout: any, args: any, context: any, timestamp: any, result: any;
  if (null == wait) wait = 100;

  function later(args: any) {
    return () => {
      const last = Date.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later(args), wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          context = args = null;
        }
      }
    };
  }

  const debounced = (...argsIn: any) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    context = this;
    timestamp = Date.now();
    args = argsIn;
    const callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later(args), wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };

  debounced.clear = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  debounced.flush = () => {
    if (timeout) {
      result = func.apply(context, args);
      context = args = null;

      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
};
