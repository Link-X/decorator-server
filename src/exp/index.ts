import { Get, Query, Post, SetHeader, HttpCode, ContentType, Redirect, Controller, Provide, Inject } from "../index";
import { CONTROLLER, PROVIDE_TARGET, INJECT_TARGET } from "../variable/reflect-var";
import { mapRouter } from "../core/utils";

@Provide()
export class Test {
  aaaa() {
    console.log(12344);
  }
}

@Provide()
@Controller("/api")
export class SomeClass {
  @Inject()
  useTest: Test;

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

const assemble = (cls: any) => {
  const pr = Reflect.getMetadata(PROVIDE_TARGET, cls);
  const cl = Reflect.getMetadata(CONTROLLER, cls);
  const inj = Reflect.getMetadata(INJECT_TARGET, cls);

  const clsObj = new SomeClass()
  console.log(clsObj.useTest)
  const mthods = mapRouter(clsObj)[0];
  console.log(pr, cl, mthods, inj);
  return {};
};

assemble(SomeClass);
