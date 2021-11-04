import {
  RESPONSE,
  WEB_RESPONSE_HTTP_CODE,
  WEB_RESPONSE_REDIRECT,
  WEB_RESPONSE_CONTENT_TYPE,
  WEB_RESPONSE_HEADER
} from "../variable/meta-name";
import { saveMeta } from "./common";

const createResponseDecorator = (data: any) => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    saveMeta(target, data, RESPONSE, key);
    return descriptor;
  };
};

export const Redirect = (url: string, code = 302) => {
  return createResponseDecorator({ type: WEB_RESPONSE_REDIRECT, url, code });
};

export const HttpCode = (code: number) => {
  return createResponseDecorator({ type: WEB_RESPONSE_HTTP_CODE, code });
};

export const SetHeader = (
  headerKey: string | Record<string, any>,
  value?: string
) => {
  let headerObject: Record<string, any> = {};
  if (value) {
    headerObject[headerKey as string] = value;
  } else {
    headerObject = headerKey as Record<string, any>;
  }
  return createResponseDecorator({
    type: WEB_RESPONSE_HEADER,
    setHeaders: headerObject,
  });
};

export const ContentType = (contentType: string) => {
  return createResponseDecorator({
    type: WEB_RESPONSE_CONTENT_TYPE,
    contentType,
  });
};
