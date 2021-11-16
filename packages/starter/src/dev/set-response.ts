import { Context } from 'koa';

const contentTypes: { [key: string]: string } = {
  html: 'text/html',
  json: 'application/json',
  text: 'text/plain',
  form: 'multipart/form-data',
};

export default class SetResponse {
  public modify: (response: responseType[], ctx: Context) => void;

  constructor() {
    /** 根据meta修改response */
    this.modify = (response: responseType[], ctx: Context) => {
      // @ts-expect-error: TODO
      response.forEach((v) => this[v.type](ctx, v));
    };
  }

  responseContentType(ctx: Context, item: responseType) {
    const type = contentTypes[item.contentType] || item.contentType;
    ctx.set('content-type', type);
  }

  responseHttpCode(ctx: Context, item: responseType) {
    ctx.response.status = item.code as number;
  }

  responseHeader(ctx: Context, item: responseType) {
    ctx.set(item.setHeaders);
  }

  responseRedirect(ctx: Context, item: responseType) {
    ctx.response.redirect(item.url as string);
    this.responseHttpCode(ctx, item);
  }
}
