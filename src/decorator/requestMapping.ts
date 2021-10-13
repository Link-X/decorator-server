import "reflect-metadata";

import { ROUTER } from "../variable/reflect-var";
import { saveMeta } from "./common";

const createMappingDecorator = (method: metaType.methodType) => {
  return (path: string, opt: any = { middleware: [] }): MethodDecorator => {
    return (target, key: string, descriptor: PropertyDescriptor) => {
      saveMeta(
        target,
        {
          path,
          requestMethod: method,
          propertyName: key,
          middleware: opt.middleware,
        },
        ROUTER,
        key
      );
      return descriptor;
    };
  };
};

export const Get = createMappingDecorator("GET");
export const Post = createMappingDecorator("POST");
export const All = createMappingDecorator("ALL");
