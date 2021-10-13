import "reflect-metadata";
import { OBJ_DEF_CLS } from "../variable/reflect-var";

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

export function saveObjectDefProps(target: any, props = {}) {
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