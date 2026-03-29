import test from 'node:test';
import assert from 'node:assert/strict';

import { createScrollSampler } from './scrub-controller.js';

function createFakeRaf() {
  const queue = [];

  return {
    requestFrame(callback) {
      queue.push(callback);
      return queue.length;
    },
    cancelFrame() {},
    step() {
      const callback = queue.shift();
      assert.ok(callback, 'expected a scheduled animation frame');
      callback();
    },
    get size() {
      return queue.length;
    }
  };
}

test('continues sampling scroll positions across frames after a single wake-up', () => {
  const seen = [];
  let scrollY = 0;
  const raf = createFakeRaf();

  const sampler = createScrollSampler({
    readScrollY: () => scrollY,
    onScrollPosition: (value) => seen.push(value),
    requestFrame: raf.requestFrame,
    cancelFrame: raf.cancelFrame,
    stableFrames: 2
  });

  sampler.wake();
  assert.equal(raf.size, 1);

  raf.step();
  scrollY = 120;
  raf.step();
  scrollY = 260;
  raf.step();

  assert.deepEqual(seen, [0, 120, 260]);
});

test('stops polling after scroll position is stable for the configured number of frames', () => {
  let scrollY = 42;
  const raf = createFakeRaf();

  const sampler = createScrollSampler({
    readScrollY: () => scrollY,
    onScrollPosition: () => {},
    requestFrame: raf.requestFrame,
    cancelFrame: raf.cancelFrame,
    stableFrames: 2
  });

  sampler.wake();
  raf.step();
  raf.step();
  raf.step();

  assert.equal(raf.size, 0);
});
