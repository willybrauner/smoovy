import { listenCompose } from '@smoovy/event';

import { component, ComponentManager, OnListen } from '../../src';

@component('[data-cmp1]')
export class Component1 {
  constructor(element: HTMLElement) {
    element.textContent += ' CMP 1';
  }
}

@component('[data-cmp2]')
export class Component2 implements OnListen {
  constructor(element: HTMLElement) {
    element.textContent += ' CMP 2';
  }

  public onListen() {
    console.log('listening');
    return listenCompose(() => {
      console.log('unlistening');
    });
  }

  public async onDestroy() {
    console.log('removing...');
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('now removed');
        resolve();
      }, 10000);
    });
  }
}

ComponentManager.update();

window['Manager'] = ComponentManager;
