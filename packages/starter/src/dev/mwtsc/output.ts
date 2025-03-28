import Table from 'cli-table3';
import { EventEmitter } from 'events';
import { colors, getIp, output } from './util';

// 定义 renderPerfInit 方法中 items 数组元素的类型
type PerfInitItem = {
  entryType: string;
  name: string;
  duration: number;
};

// 定义 renderPerfStats 方法中 items 数组元素的类型
type PerfStatsItem = {
  name: string;
  duration: number;
};

// 定义 renderServerFirstReady 方法中 serverReportOption 的类型
type ServerReportOption = {
  port: number;
  ssl: boolean;
};

class ConsoleOutput extends EventEmitter {
  constructor() {
    super();
  }

  renderPerfInit(items: PerfInitItem[]): void {
    const table = new Table({
      head: ['name', 'duration(ms)'],
    });

    for (const item of items) {
      if (item.entryType === 'measure') {
        table.push([
          item.name.replace('MidwayInitialize:', ''),
          item.duration.toFixed(2),
        ]);
      }
    }

    output('\nMidway Performance Statistics:');
    output(table.toString());
  }

  renderPerfStats(items: PerfStatsItem[]): void {
    const table = new Table({
      head: ['Stage', 'Time(ms)'],
    });

    for (const item of items) {
      table.push([item.name, item.duration.toFixed(2)]);
    }

    output('\nPerformance Statistics:');
    output(table.toString());
    output('');
  }

  renderKeepAlive(): void {
    output(colors.red('*'.repeat(120)));
    output(
      `A ${colors.red(
        `${colors.bright('Critical unhandledRejection or uncaughtException')}`,
      )} was detected and the process has exited automatically.`,
    );
    output('Please make sure to handle it.');
    output(
      'The --keepalive parameter was enabled, we will do our best to ensure the process remains normal.',
    );
    output(colors.red('*'.repeat(120)));
  }

  renderServerFirstReady(
    serverReportOption: ServerReportOption,
    during: number,
    hasPaths: boolean,
    debugUrl: string | undefined,
  ): void {
    // 第一次启动把端口等信息打印出来
    output('');
    output(
      `${colors.green('Node.js server')} ${colors.dim(
        'started in',
      )} ${during} ms ${
        hasPaths ? colors.dim('and enable compile with ') + 'tsc-alias' : ''
      }\n`,
    );
    if (serverReportOption && serverReportOption.port) {
      const protocol = serverReportOption.ssl ? 'https' : 'http';
      output(
        `${colors.green('➜')}  Local:    ${colors.cyan(
          `${protocol}://127.0.0.1:${colors.bright(
            serverReportOption.port+'',
          )}${colors.cyan('/')}`,
        )} `,
      );
      const netWorkIp = getIp();
      if (netWorkIp) {
        output(
          `${colors.green('➜')}  ${colors.dim(
            `Network:  ${protocol}://${netWorkIp}:${serverReportOption.port}/ `,
          )}`,
        );
      }
      if (debugUrl) {
        output(
          `${colors.green('➜')}  ${colors.dim(
            `Debugger: devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=${debugUrl.replace(
              'ws://',
              '',
            )}`,
          )}`,
        );
      }
      output('');
    }
  }

  renderServerReady(during: number, debugUrl: string | undefined): void {
    output('');
    output(
      `${colors.green('Node.js server')} ${colors.dim(
        'restarted in',
      )} ${during} ms`,
    );
    if (debugUrl) {
      output(
        `${colors.green('➜')}  ${colors.dim(
          `Debugger: devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=${debugUrl.replace(
            'ws://',
            '',
          )}`,
        )}`,
      );
    }
    output('');
  }
}

export default new ConsoleOutput();
