interface InjectOptions {
  sign: string | undefined;
  target: any;
  targetKey: string;
  index?: number;
  args?: any;
}
const savePropertyInject = (opts: InjectOptions) => {
  let sign = opts.sign;
  if (!sign) {
  }
};

export function Inject(sign?: string) {
  return function (target: any, targetKey: string): void {
    savePropertyInject({ target, targetKey, sign });
  };
}
