import { Context } from 'koa';

const contentTypes: Record<string, string> = {
  html: 'text/html',
  json: 'application/json',
  text: 'text/plain',
  form: 'multipart/form-data',
};

export default class SetResponse {
  constructor() {
    console.log('SetResponse constructor');
  }

  /**
   * 根据元数据修改响应
   * @param response 响应配置数组
   * @param ctx Koa 上下文
   */
  public modify(response: responseType[], ctx: Context): void {
    response.forEach((item) => {
      console.log(item.type)
      const handler = this[item.type as keyof this];
      if (typeof handler === 'function') {
        try {
          handler.call(this, ctx, item);
        } catch (error) {
          console.error(`处理响应类型 ${item.type} 时出错:`, error);
        }
      } else {
        console.warn(`未找到处理响应类型 ${item.type} 的方法`);
      }
    });
  }

  /**
   * 设置响应的 Content-Type
   * @param ctx Koa 上下文
   * @param item 响应配置项
   */
  responseContentType(ctx: Context, item: responseType): void {
    const type = item.contentType
      ? contentTypes[item.contentType] || item.contentType
      : null;
    if (type) {
      ctx.set('content-type', type);
    } else {
      console.warn('未提供有效的 Content-Type');
    }
  }

  /**
   * 设置响应的 HTTP 状态码
   * @param ctx Koa 上下文
   * @param item 响应配置项
   */
  private responseHttpCode(ctx: Context, item: responseType): void {
    if (typeof item.code === 'number') {
      ctx.response.status = item.code;
    } else {
      console.warn('未提供有效的 HTTP 状态码');
    }
  }

  /**
   * 设置响应头
   * @param ctx Koa 上下文
   * @param item 响应配置项
   */
  responseHeader(ctx: Context, item: responseType): void {
    if (item.setHeaders) {
      ctx.set(item.setHeaders);
    } else {
      console.warn('未提供有效的响应头信息');
    }
  }

  /**
   * 重定向响应
   * @param ctx Koa 上下文
   * @param item 响应配置项
   */
  responseRedirect(ctx: Context, item: responseType): void {
    if (item.url) {
      ctx.response.redirect(item.url);
      this.responseHttpCode(ctx, item);
    } else {
      console.warn('未提供有效的重定向 URL');
    }
  }
}
