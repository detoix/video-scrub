import test from 'node:test';
import assert from 'node:assert/strict';

import { createReversePlayback } from './reverse-playback.js';

test('schedules one reverse seek at a time and completes at zero', () => {
  const events = [];
  const reverse = createReversePlayback({
    stepSize: 0.5,
    onSeek: (time) => events.push({ type: 'seek', time }),
    onProgress: (time) => events.push({ type: 'progress', time }),
    onComplete: () => events.push({ type: 'complete' })
  });

  reverse.start(1.2);
  assert.deepEqual(events, [{ type: 'seek', time: 0.7 }]);

  reverse.handleSeeked(0.7);
  assert.deepEqual(events.slice(-2), [
    { type: 'progress', time: 0.7 },
    { type: 'seek', time: 0.2 }
  ]);

  reverse.handleSeeked(0.2);
  assert.deepEqual(events.slice(-2), [
    { type: 'progress', time: 0.2 },
    { type: 'seek', time: 0 }
  ]);

  reverse.handleSeeked(0);
  assert.deepEqual(events.slice(-2), [
    { type: 'progress', time: 0 },
    { type: 'complete' }
  ]);
});

test('ignores seek completion events when not actively reversing', () => {
  const events = [];
  const reverse = createReversePlayback({
    stepSize: 0.25,
    onSeek: (time) => events.push({ type: 'seek', time }),
    onProgress: (time) => events.push({ type: 'progress', time }),
    onComplete: () => events.push({ type: 'complete' })
  });

  reverse.handleSeeked(1.5);
  assert.deepEqual(events, []);

  reverse.start(0.4);
  reverse.cancel();
  reverse.handleSeeked(0.15);

  assert.deepEqual(events, [{ type: 'seek', time: 0.15 }]);
});
