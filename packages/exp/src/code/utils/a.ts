import {
  Provide
} from '@decorator-server/decorator';

@Provide()
export class first {
  kff = 321
  somePostMethod() {
    console.log(this.kff)
  }

}
