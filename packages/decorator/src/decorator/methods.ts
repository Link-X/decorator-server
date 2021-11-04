import 'reflect-metadata';

import { ROUTER } from '../variable/meta-name';
import { saveMeta } from './common';

interface optType {
  middleware: any[];
}

const createMethodsDecorator = (method: metaType.methodType) => {
  return (path: string, opt: optType = { middleware: [] }): MethodDecorator => {
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
        key,
      );
      return descriptor;
    };
  };
};

export const Get = createMethodsDecorator('GET');
export const Post = createMethodsDecorator('POST');
export const All = createMethodsDecorator('ALL');
