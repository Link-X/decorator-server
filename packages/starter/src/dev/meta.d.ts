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

type routerType = { route: routeType[]; methodName: string; params: any };

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
