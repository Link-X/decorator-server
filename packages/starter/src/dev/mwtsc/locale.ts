import { colors } from './util';
import { format } from 'util';

function underline(str: string): string {
  return `\x1b[4m${str}\x1b[0m`;
}

const getLanguage = (): string => {
  const lang = process.env.LC_ALL || process.env.LANG || process.env.LANGUAGE;
  if (!lang) {
    return 'en';
  }

  const languageCode = lang.split('.')[0];
  const primaryLanguage = languageCode.split('_')[0];

  if (primaryLanguage !== 'en' && primaryLanguage !== 'zh') {
    return 'en';
  }

  return primaryLanguage;
};

const language: string = getLanguage();

// 定义 locales 对象的类型
type Locales = {
  [key: string]: {
    greeting: string;
    versionWarn: string;
    updateTip: string;
    continuePrompt: string;
    exitMessage: string;
    proceedMessage: string;
    invalidInput: string;
    // 若有更多属性，继续添加
  };
};

const locales: Locales = {
  en: {
    greeting: 'Hello, world!',
    versionWarn: `Some installed Midway components are not compatible with the core version, which may cause system exceptions\nThere are ${colors.red(
      '%s',
    )} modules with version issues in node_modules`,
    updateTip: `Please use ${colors.cyan(
      '(p)npx midway-version -m',
    )} to update to the compatible version\nor ${colors.cyan(
      '(p)npx midway-version -u',
    )} to update to the latest version`,
    continuePrompt: `Do you want to continue? (${underline('y')}es/${underline(
      'n',
    )}o): `,
    exitMessage: 'Exiting the process.',
    proceedMessage: 'Proceeding to the next step...',
    invalidInput: 'Invalid input. Please enter "yes" or "no".',
  },
  zh: {
    greeting: '你好，世界！',
    versionWarn: `${colors.yellow('Warning')} ${colors.dim(
      '检查到以下',
    )}${colors.yellow(' %s ')}${colors.dim('个 Midway 组件存在兼容性问题')}`,
    // eslint-disable-next-line
    // @ts-ignore
    versionItem: `${colors.yellow('➜')}  ${colors.dim(
      '%s 当前版本：',
    )}%s ${colors.dim('可用版本: ')}%s`,
    updateTip: `请使用 ${colors.cyan(
      '(p)npx midway-version -m',
    )} 命令更新到兼容版本\n或 ${colors.cyan(
      '(p)npx midway-version -u',
    )} 更新到最新版本`,
    continuePrompt: `是否继续启动？(${underline('y')}es/${underline('n')}o):`,
    exitMessage: '正在退出程序。',
    proceedMessage: '进入下一步...',
    invalidInput: '输入无效。请输入“是”或“否”。',
  },
};

export function getLocalizedString(key: string, args: any[] = []): string {
  const locale: Record<string, string> = locales[language];
  return format(locale[key], ...args);
}
