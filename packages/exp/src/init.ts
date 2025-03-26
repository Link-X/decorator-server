import { LifeCycle, Container } from '@decorator-server/decorator';
import Application from 'koa';
import KoaBody from 'koa-body';

class sequelize {
  query(a: number) {
    console.log(a, 'sequelize')
  }
}

export default class Init implements LifeCycle {
  async onReady(cn: Container, app: Application) {
    console.log('onready');
    app.use(KoaBody());
    cn.registerObject('sequelize', sequelize);
  }

  async onStop() {
    console.log('stop');
  }
}
