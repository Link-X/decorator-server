import { INJECT_TARGET } from '../variable/reflect-var';
import { saveMeta } from './common';
import { isClass } from '../core/utils';

interface InjectOptions {
  target: any;
  targetKey: string;
  index?: number;
  args?: any;
}

const savePropertyInject = (opts: InjectOptions) => {
  const { targetKey, target } = opts;
  const propertyType = Reflect.getMetadata('design:type', target, targetKey);
  if (isClass(propertyType)) {
    saveMeta(
      target,
      { value: targetKey, key: 'inject', injectVal: propertyType.name },
      INJECT_TARGET,
      targetKey,
    );
  } else {
    console.log('inject 只允许注入class');
  }
};

export function Inject() {
  return function (target: any, targetKey: string, index?: number): void {
    if (typeof index === 'number') {
    } else {
      savePropertyInject({ target, targetKey });
    }
  };
}
