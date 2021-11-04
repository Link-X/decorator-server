import { CONTROLLER } from "../variable/meta-name";
import { saveMeta } from "./common";

export const Controller = (
  prefix: string,
  routerOptions: {
    middleware?: any[];
  } = { middleware: [] }
): ClassDecorator => {
  return (target: any) => {
    saveMeta(
      target,
      {
        prefix,
        routerOptions,
      },
      CONTROLLER,
      "CLS"
    );
  };
};
