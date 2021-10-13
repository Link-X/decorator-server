import { Container } from "./container";

import * as Exp from "../exp/index";

const containerCls = new Container();
Object.values(Exp).forEach((v) => {
  containerCls.bind(v);
});
