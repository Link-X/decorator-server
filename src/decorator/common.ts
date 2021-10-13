import "reflect-metadata";

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
