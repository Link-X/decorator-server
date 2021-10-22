import { LifeCycle, Container } from '@decorator-server/decorator';
import Application from 'koa';
export default class Init implements LifeCycle {
    onReady(cn: Container, app: Application): Promise<void>;
    onStop(): Promise<void>;
}
