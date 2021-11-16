const Get = (path: string) => {
  return (target, key: string, descriptor: PropertyDescriptor) => {
    // ...收集数据
    console.log(target, key, path);
    return descriptor;
  };
};

const Controller = (path: string) => {
  return (target: any) => {
    // ...收集数据
    console.log(target, path);
  };
};

@Controller('/')
class Server {
  @Get('/hello')
  getFunc() {
    return 'hello world!';
  }
}
