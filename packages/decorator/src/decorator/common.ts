import "reflect-metadata";
import { OBJ_DEF_CLS } from "../variable/meta-name";

/** 保存装饰器元数据 */
export const saveMeta = (
  target: any,
  data: any,
  metaKey: string,
  propertyName: string
) => {
  const dataKey = `${metaKey}-${propertyName.toString()}`;
  if (typeof target === "object" && target.constructor) {
    target = target.constructor;
  }
  let m: Map<string, any>;

  // 是否使用过相同的装饰器
  if (Reflect.hasOwnMetadata(metaKey, target)) {
    m = Reflect.getMetadata(metaKey, target);
  } else {
    m = new Map<string, any>();
  }
  if (!m.has(dataKey)) {
    m.set(dataKey, []);
  }
  m.get(dataKey).push(data);
  Reflect.defineMetadata(metaKey, m, target);
};

/** 保存特数据装饰器元数据 */
export function lifeCycle(target: any, props = {}) {
   if (typeof target === "object" && target.constructor) {
    target = target.constructor;
  }
  if (Reflect.hasMetadata(OBJ_DEF_CLS, target)) {
    const originProps = Reflect.getMetadata(OBJ_DEF_CLS, target);

    Reflect.defineMetadata(OBJ_DEF_CLS, Object.assign(originProps, props), target);
  } else {
    Reflect.defineMetadata(OBJ_DEF_CLS, props, target);
  }
  return target;
}
