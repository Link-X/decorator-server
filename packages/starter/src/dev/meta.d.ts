interface routeType {
  requestMethod: 'GET' | 'POST' | 'ALL' | 'HEAD' | 'OPTIONS';
  propertyName: string;
  path: string;
  middleware: any[];
}

type baseType = {
  uuid: string;
  orginName: string;
  id: string;
};

type controllerType = { prefix: string; routerOptions: { middleware: any[] } };

type responseType = {
  type: string;
  url?: string;
  code?: number;
  setHeaders?: any
  [string: string]: string;
};

type routerType = {
  route: routeType[];
  methodName: string;
  params?: any;
  response?: responseType[];
};

type injectType = {
  [string: string]: { value: string; key: string; injectVal: string }[];
};

type metaType = {
  base: baseType;
  controller: controllerType[];
  router: routerType[];
  inject: injectType;
};

type itemType = {
  cls: any;
  meta: metaType;
};


type ctxType = Koa.ParameterizedContext<
  Koa.DefaultState,
  Koa.DefaultContext &
    Router.RouterParamContext<Koa.DefaultState, Koa.DefaultContext>,
  any
>;
