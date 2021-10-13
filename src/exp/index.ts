import {
  Get,
  Query,
  Post,
  SetHeader,
  HttpCode,
  ContentType,
  Redirect,
  Controller,
  Provide
} from "../index";
import { mapRouter } from "../core/utils";

@Provide()
@Controller("/api")
export class SomeClass {
  @Get("/")
  @Get("/main")
  @SetHeader({ accept: "*/*" })
  @HttpCode(301)
  @ContentType("json")
  @Redirect("/ccc")
  someGetMethod(@Query() id: string) {
    console.log(id);
    return "hello world";
  }

  @Post("/b")
  somePostMethod(@Query() key: string) {
    console.log(key);
  }
}

console.log(Reflect.getMetadata("controller", SomeClass));
console.log(Reflect.getMetadata("injectTarget", SomeClass));

console.dir(mapRouter(new SomeClass())[0]);
