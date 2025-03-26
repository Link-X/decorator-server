import 'reflect-metadata';
import { OBJ_DEF_CLS } from '../variable/meta-name';

/**
 * 保存装饰器元数据
 * @param target 目标对象或构造函数
 * @param data 要保存的数据
 * @param metaKey 元数据键
 * @param propertyName 属性名
 */
export const saveMeta = (
  target: any,
  data: any,
  metaKey: string,
  propertyName: string,
): void => {
  const dataKey = `${metaKey}-${propertyName.toString()}`;
  // 确保 target 为构造函数
  if (typeof target === 'object' && target.constructor) {
    target = target.constructor;
  }
  let metaMap: Map<string, any[]>;

  // 检查是否已有相同元数据键的元数据
  if (Reflect.hasOwnMetadata(metaKey, target)) {
    metaMap = Reflect.getMetadata(metaKey, target);
  } else {
    metaMap = new Map<string, any[]>();
  }

  // 若不存在对应 dataKey 的数据数组，则初始化
  if (!metaMap.has(dataKey)) {
    metaMap.set(dataKey, []);
  }
  // 将数据添加到对应数组中
  metaMap.get(dataKey)?.push(data);

  // 保存元数据
  Reflect.defineMetadata(metaKey, metaMap, target);
};

/**
 * 保存特数据装饰器元数据
 * @param target 目标对象或构造函数
 * @param props 要保存的属性对象
 * @returns 处理后的目标对象或构造函数
 */
export function lifeCycle(target: any, props: Record<string, any> = {}): any {
  // 确保 target 为构造函数
  if (typeof target === 'object' && target.constructor) {
    target = target.constructor;
  }

  let originProps: Record<string, any> = {};
  // 检查是否已有 OBJ_DEF_CLS 元数据
  if (Reflect.hasMetadata(OBJ_DEF_CLS, target)) {
    originProps = Reflect.getMetadata(OBJ_DEF_CLS, target);
  }

  // 合并属性
  const mergedProps = { ...originProps, ...props };

  // 保存合并后的属性作为元数据
  Reflect.defineMetadata(OBJ_DEF_CLS, mergedProps, target);
  return target;
}
