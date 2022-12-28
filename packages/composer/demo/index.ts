/* eslint-disable no-useless-constructor */
import { component, Composer, composer, Service, service } from '../src';
import { config } from '../src/config';
import { query, queryAll } from '../src/query';

export class TestService extends Service<any, TestService> {
  get name() { return 'test'; }
  get child() { return TestService; }

  async init() {
    this.resolve('test-service');
  }
}

export class TestService2 extends Service<any, TestService> {
  get name() { return 'test2'; }
  get child() { return TestService2; }

  async init() {
    this.resolve('test-service2');
  }
}

export class SampleService extends Service<string, SampleService> {
  @service(TestService)
  private testService!: TestService;

  @service(TestService2)
  private testService2!: TestService2;

  get name() { return 'sample'; }
  get child() { return SampleService; }

  async init() {
    // console.log(this.testService2);
    this.resolve(await this.testService);
  }
}

@component('sample-component')
class SampleComponent {
  @service(SampleService, true)
  protected sample!: string;

  @composer()
  protected composer!: Composer;

  @config('message')
  private message = 'Default message';

  @query('#imuniq')
  private uniq!: HTMLElement;

  @queryAll('.select-me', { parse: list => Array.from(list) })
  private selectMe!: NodeListOf<HTMLElement>[];

  constructor(
    private element: HTMLElement
  ) {}

  onCreate() {
    console.log(this.sample, this.composer);
    console.log('message:', this.message);
    console.log(this.uniq, this.selectMe);
  }
}

@composer({
  services: [
    new SampleService(),
    new TestService2(),
    new TestService()
  ],
  components: [
    SampleComponent
  ]
})
class App {
  @composer()
  private composer!: Composer;

  @service(TestService2)
  private testService2!: TestService2;

  async onCreate() {
    console.log('->', await this.testService2);
  }
}

// eslint-disable-next-line no-new
new App();