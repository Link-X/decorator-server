import { INJECT_TARGET } from "../variable/reflect-var";
import { saveMeta } from "./common";

interface InjectOptions {
  target: any;
  targetKey: string;
  index?: number;
  args?: any;
}
const ToString = Function.prototype.toString;

function fnBody(fn: any) {
  return ToString.call(fn)
    .replace(/^[^{]*{\s*/, "")
    .replace(/\s*}[^}]*$/, "");
}
export function isClass(fn: any) {
  if (typeof fn !== "function") {
    return false;
  }

  if (/^class[\s{]/.test(ToString.call(fn))) {
    return true;
  }

  // babel.js classCallCheck() & inlined
  const body = fnBody(fn);
  return /classCallCheck\(/.test(body) || /TypeError\("Cannot call a class as a function"\)/.test(body);
}

const savePropertyInject = (opts: InjectOptions) => {
  const { targetKey, target } = opts;
  const propertyType = Reflect.getMetadata("design:type", target, targetKey);
  if (isClass(propertyType)) {
    saveMeta(target, { value: targetKey, key: "inject", injectVal: propertyType.name }, INJECT_TARGET, targetKey);
  } else {
    console.log('inject 只允许注入class')
  }
};

export function Inject() {
  return function (target: any, targetKey: string, index?: number): void {
    if (typeof index === "number") {
    } else {
      savePropertyInject({ target, targetKey });
    }
  };
}
