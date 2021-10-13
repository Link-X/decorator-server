import * as crypto from "crypto";
import { INJECT_TARGET } from "../variable/reflect-var";

export function generateRandomId(): string {
  return crypto.randomBytes(16).toString("hex");
}

const saveProvide = (sign: string = '', target: any, override?: boolean) => {
  if (Reflect.hasOwnMetadata(INJECT_TARGET, target) && !override) {
    throw new Error('有了,覆盖设置一下override=true');
  }
  if (!sign) {
    sign = target.name;
  }
  const uuid = generateRandomId();
  Reflect.defineMetadata(
    INJECT_TARGET,
    {
      id: sign,
      orginName: target.name,
      uuid,
    },
    target
  );
  return target
};

export const Provide = (sign?: string) => {
  return (target: any) => {
    return saveProvide(sign, target);
  };
};
