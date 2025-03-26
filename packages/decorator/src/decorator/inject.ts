import { INJECT_TARGET } from '../variable/meta-name';
import { saveMeta } from './common';
import { isClass } from '../utils/utils';

// 定义注入选项的接口
interface InjectOptions {
  target: any;
  targetKey: string;
  index?: number;
  args?: any;
}

/**
 * 保存属性注入的元数据
 * @param opts 注入选项
 */
const savePropertyInject = (opts: InjectOptions): void => {
  const { targetKey, target } = opts;
  // 获取属性的设计类型
  const propertyType = Reflect.getMetadata('design:type', target, targetKey);

  let injectValue: string;
  if (isClass(propertyType)) {
    // 如果是类类型，使用类名作为注入值
    injectValue = propertyType.name;
  } else {
    // 否则使用属性名作为注入值
    injectValue = targetKey;
  }

  // 调用 saveMeta 函数保存元数据
  saveMeta(
    target,
    { value: targetKey, key: 'inject', injectVal: injectValue },
    INJECT_TARGET,
    targetKey,
  );
};

/**
 * Inject 装饰器，用于标记需要注入的属性或参数
 * @param key 可选的注入键
 * @returns 装饰器函数
 */
export function Inject(
  key?: string,
): (target: any, targetKey: string, index?: number) => void {
  return (target: any, targetKey: string, index?: number): void => {
    if (key) {
      // 打印传入的 key，可根据需求进行后续处理
      console.log(key);
    }

    if (typeof index === 'number') {
      // 处理参数注入逻辑，目前为空，可根据需求实现
      console.warn('参数注入逻辑未实现');
    } else {
      // 处理属性注入
      savePropertyInject({ target, targetKey });
    }
  };
}
