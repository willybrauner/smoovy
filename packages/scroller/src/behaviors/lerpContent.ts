import { Ticker, TickerThread } from '@smoovy/ticker';
import { cutDec, lerp, Browser } from '@smoovy/utils';

import { OutputTransformEvent, ScrollBehavior, ScrollerEvent } from '../core';

export interface Config {
  /**
   * The damping used for the linear interpolation
   * The lower this value the smoother the animation
   * Default: 0.1
   */
  damping?: number;

  /**
   * The damping for mobile (touch) devices
   * Default: 0.18
   */
  mobileDamping?: number;

  /**
   * The amount of output decimals to preserve. Usually more than 2
   * does not makes much sense when transforming the output normally.
   * Default: 2
   */
  precision?: number;

  /**
   * Defines when the animation will end.
   * The higher this value the more precise it will be.
   * This is simply used to cut the decimals of the delta value
   * from the current animation in order to determine if the animation's
   * finished
   * Default: 1
   */
  tolerance?: number;
}

const defaultConfig = {
  damping: 0.1,
  mobileDamping: 0.18,
  precision: 2,
  tolerance: 1
};

const behavior: ScrollBehavior<Config> = (config = {}) => {
  const cfg = Object.assign(defaultConfig, config);

  return (scroller) => {
    let thread: TickerThread;
    const ticker = new Ticker();
    const damping = Browser.mobile ? cfg.mobileDamping : cfg.damping;
    const unlisten = scroller.on<OutputTransformEvent>(
      ScrollerEvent.TRANSFORM_OUTPUT,
      ({ pos, step }) => {
        if (thread) {
          thread.kill();
        }

        thread = ticker.add((_delta, _time, kill) => {
          const virtual = scroller.position.virtual;
          const outputX = lerp(pos.x, virtual.x, damping);
          const outputY = lerp(pos.y, virtual.y, damping);
          const diffX = cutDec(Math.abs(virtual.x - outputX), cfg.tolerance);
          const diffY = cutDec(Math.abs(virtual.y - outputY), cfg.tolerance);

          if (diffX > 0 || diffY > 0) {
            step({
              x: cutDec(outputX, cfg.precision),
              y: cutDec(outputY, cfg.precision)
            });
          } else {
            kill();
          }
        });
      }
    );

    return () => {
      unlisten();
      ticker.kill();
    };
  };
};

export { Config as LerpContentConfig };
export default behavior;
