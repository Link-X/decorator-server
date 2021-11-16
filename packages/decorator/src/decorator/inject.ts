import { INJECT_TARGET } from '../variable/meta-name';
import { saveMeta } from './common';
import { isClass } from '../utils/utils';

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
    saveMeta(
      target,
      { value: targetKey, key: 'inject', injectVal: targetKey },
      INJECT_TARGET,
      targetKey,
    );
  }
};

export function Inject(key?: string) {
  return function (target: any, targetKey: string, index?: number): void {
    if (key) {
      console.log(key);
    }
    if (typeof index === 'number') {
    } else {
      savePropertyInject({ target, targetKey });
    }
  };
}
