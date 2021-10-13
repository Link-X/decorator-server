import { saveObjectDefProps } from "./common";

export const Init = () => {
  return (target: any, propertyKey: string) => {
    return saveObjectDefProps(target, { initMethod: propertyKey });
  };
};
