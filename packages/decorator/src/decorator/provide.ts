import * as crypto from "crypto";
import { PROVIDE_TARGET } from "../variable/meta-name";

export function generateRandomId(): string {
  return crypto.randomBytes(16).toString("hex");
}

const saveProvide = (sign = '', target: any, override?: boolean) => {
  if (Reflect.hasOwnMetadata(PROVIDE_TARGET, target) && !override) {
    throw new Error('有了,要覆盖设置下verride=true');
  }
  if (!sign) {
    sign = target.name;
  }
  const uuid = generateRandomId();
  Reflect.defineMetadata(
    PROVIDE_TARGET,
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
