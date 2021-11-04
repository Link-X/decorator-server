import { lifeCycle } from "./common";

export const Init = () => {
  return (target: any, propertyKey: string) => {
    return lifeCycle(target, { initMethod: propertyKey });
  };
};
