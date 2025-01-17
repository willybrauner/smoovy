import { describe, expect, it, vi } from 'vitest';

import { tweenFromTo } from '../src/tween';

describe('tween', () => {
  it('should mutate and tween object property from 0 to 100 in 300ms',
    () => new Promise<void>((resolve) => {
      const mutation = { x: 0 };

      tweenFromTo(mutation, { x: 100 }, { duration: 300 });

      setTimeout(() => {
        expect(mutation.x).toBe(100);
        resolve();
      }, 500);
    })
  );

  it('should not mutate but tween the property from 0 to 100 in 300ms',
    () => new Promise<void>((resolve) => {
      const mutation = { x: 0 };

      tweenFromTo(mutation, { x: 100 }, { duration: 300, mutate: false });

      setTimeout(() => {
        expect(mutation.x).toBe(0);
        resolve();
      }, 500);
    })
  );

  it('should stop the tween after 100ms', () => new Promise<void>((resolve) => {
    const data = { x: 0 };
    const tween = tweenFromTo(data, { x: 100 }, { duration: 300 });

    setTimeout(() => {
      tween.stop();
    }, 100);

    setTimeout(() => {
      expect(data.x).toBeLessThan(100);
      resolve();
    }, 500);
  }));

  it('should tween from 0 to 0 without change and options', () => new Promise<void>((resolve) => {
    const data = { x: 0 };

    tweenFromTo(data, { x: 0 });

    setTimeout(() => {
      expect(data.x).toBe(0);
      resolve();
    }, 100);
  }));

  it('should not tween invalid from/to options', () => new Promise<void>((resolve) => {
    const data = { y: 0 };

    tweenFromTo(data, { x: 0 } as any, { duration: 20 });

    setTimeout(() => {
      expect(data.y).toBe(0);
      resolve();
    }, 50);
  }));

  it('should not overwrite running tween', () => new Promise<void>((resolve) => {
    const data = { y: 0 };

    tweenFromTo(data, { y: 50 }, { duration: 20, overwrite: false });
    tweenFromTo(data, { y: 50 }, { duration: 50, overwrite: false });

    setTimeout(() => {
      expect(data.y).toBeLessThan(50);
    }, 15);

    setTimeout(() => {
      expect(data.y).toEqual(50);
      resolve();
    }, 150);
  }));

  it('should call the update method', () => new Promise<void>((resolve) => {
    const data = { y: 0 };
    const update = vi.fn();

    tweenFromTo(data, { y: 50 }, {
      duration: 100,
      onUpdate: update
    });

    setTimeout(() => {
      expect(update).toHaveBeenCalled();
      resolve();
    }, 120);
  }));

  it('should not throw an error if stopped multiple times', () => new Promise<void>((resolve) => {
    const tween = tweenFromTo({ y: 0 }, { y: 50 }, { duration: 100 });

    setTimeout(() => {
      tween.stop();
      tween.stop();
      tween.stop();
      resolve();
    }, 50);
  }));

  it('should call the stop method', () => new Promise<void>((resolve) => {
    const stop = vi.fn();
    const tween = tweenFromTo(
      { y: 0 },
      { y: 50 },
      {
        duration: 200,
        onStop: stop
      }
    );

    setTimeout(() => {
      tween.stop();
      tween.stop();

      expect(stop).toBeCalledTimes(1);

      resolve();
    }, 50);
  }));

  it('should enter the complete callback', () => new Promise<void>((resolve) => {
    const data = { x: 0 };

    tweenFromTo(
      data,
      { x: 100 },
      {
        duration: 300,
        onComplete: () => {
          expect(data.x).toBe(100);
          resolve();
        }
      }
    );
  }));

  it('should overwrite the tween', () => new Promise<void>((resolve, reject) => {
    const data = { x: 0 };
    const overwriteFn = vi.fn();

    tweenFromTo(
      data,
      { x: 100 },
      {
        duration: 300,
        onOverwrite: overwriteFn,
        onComplete: () => {
          reject(new Error());
        }
      }
    );

    setTimeout(() => {
      tweenFromTo(
        data,
        { x: 100 },
        {
          duration: 200,
          onOverwrite: overwriteFn,
          onComplete: () => {
            expect(overwriteFn).toBeCalledTimes(1);
            expect(data.x).toBe(100);
            resolve();
          }
        }
      );
    }, 100);
  }));

  it('should pause and resume the tween', () => new Promise<void>((resolve) => {
    const pauseFn = vi.fn();
    const startFn = vi.fn();
    const completeFn = vi.fn();
    const dataFrom = { x: 0 };
    const dataTo = { x: 200 };
    const tween = tweenFromTo(
      dataFrom,
      dataTo,
      {
        duration: 100,
        onPause: pauseFn,
        onStart: startFn,
        onComplete: completeFn,
      }
    );

    setTimeout(() => {
      tween.pause();

      setTimeout(() => {
        expect(tween.progress).toBeLessThan(1);

        tween.start();

        expect(pauseFn).toBeCalledTimes(1);
        expect(startFn).toBeCalledTimes(2);

        setTimeout(() => {
          expect(tween.progress).toBeGreaterThanOrEqual(1);
          expect(completeFn).toBeCalledTimes(1);
          resolve();
        }, 100);
      }, 20);
    }, 20);
  }));

  it('should start after the delay', () => new Promise<void>((resolve) => {
    const delayFn = vi.fn();

    tweenFromTo(
      { x: 0 },
      { x: 100 },
      {
        delay: 100,
        onDelay: delayFn,
        onComplete: () => {
          expect(delayFn).toHaveBeenCalled();
          resolve();
        }
      }
    );
  }));

  it('should not start if paused', () => new Promise<void>((resolve) => {
    const tween = tweenFromTo(
      { x: 0 },
      { x: 100 },
      {
        paused: true,
        duration: 50
      }
    );

    expect(tween.progress).toBe(0);
    expect(tween.paused).toBe(true);
    expect(tween.complete).toBe(false);

    setTimeout(() => {
      expect(tween.progress).toBe(0);
      expect(tween.paused).toBe(true);
      expect(tween.complete).toBe(false);
      resolve();
    }, 60);
  }));

  it('should overwrite an active delay and call reset', () => new Promise<void>((resolve) => {
    let delayMs = 0;
    const resetFn = vi.fn();
    const tween = tweenFromTo(
      { x: 0 },
      { x: 100 },
      {
        delay: 200,
        duration: 200,
        onReset: resetFn,
        onDelay: (passed) => {
          delayMs = passed;
        }
      }
    );

    setTimeout(() => {
      expect(delayMs).toBeGreaterThan(90);
      expect(delayMs).toBeLessThan(200);
      expect(tween.progress).toBe(0);

      tween.reset();

      setTimeout(() => {
        expect(delayMs).toBeGreaterThan(90);
        expect(delayMs).toBeLessThan(200);
        expect(tween.progress).toBe(0);
        expect(resetFn).toBeCalledTimes(1);

        tween.stop();
        resolve();
      }, 150);
    }, 150);
  }));

  it('should not run delay if paused', () => new Promise<void>((resolve, reject) => {
    tweenFromTo(
      { x: 0 },
      { x: 100 },
      {
        paused: true,
        delay: 100,
        duration: 100,
        onStart: () => reject(new Error()),
        onDelay: () => reject(new Error())
      }
    );

    setTimeout(() => resolve(), 200);
  }));

  it('should not run callbacks if already active on start & pause', () => new Promise<void>((resolve) => {
    const startFn = vi.fn();
    const pauseFn = vi.fn();
    const tween = tweenFromTo(
      { x: 0 },
      { x: 100 },
      {
        delay: 100,
        paused: true,
        duration: 100,
        onStart: startFn,
        onPause: pauseFn
      }
    );

    setTimeout(() => {
      tween.start();
      tween.start();
      tween.start();
      tween.start();

      setTimeout(() => {
        tween.pause();
        tween.pause();
        tween.pause();
        tween.pause();

        expect(startFn).toBeCalledTimes(1);
        expect(pauseFn).toBeCalledTimes(1);
        resolve();
      }, 10);
    }, 10);
  }));

  it('should reset without mutation', () => new Promise<void>((resolve) => {
    const target = { x: 0 };
    const tween = tweenFromTo(
      target,
      { x: 100 },
      {
        mutate: false,
        duration: 100,
        onComplete: () => {
          expect(target).toMatchObject({ x: 0 });
          resolve();
        }
      }
    );

    setTimeout(() => {
      tween.reset();
    }, 50);
  }));

  it('should set the correct progress', () => new Promise<void>((resolve) => {
    const tween = tweenFromTo(
      { x: 0 },
      { x: 100 },
      {
        duration: 100,
        paused: true
      }
    );

    expect(tween.passed).toBe(0);

    setTimeout(() => {
      tween.progress = 0.5;
      expect(tween.passed).toBe(50);
      resolve();
    }, 50);
  }));
});
