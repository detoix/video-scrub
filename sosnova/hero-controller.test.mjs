import test from 'node:test';
import assert from 'node:assert/strict';

import { createHeroController } from './hero-controller.js';

test('starts on the master node with no active transition', () => {
  const controller = createHeroController({ reverseBlendWindow: 0.25 });

  assert.deepEqual(controller.getState(), {
    mode: 'node',
    currentNodeId: 'master',
    pendingConnectionId: null,
    targetNodeId: null,
    backVisible: false,
    reverseBlendActive: false
  });
});

test('moves along a connection and lands on the target node when forward playback ends', () => {
  const controller = createHeroController({ reverseBlendWindow: 0.25 });

  const action = controller.handleConnectionClick({
    connectionId: 'master-house-1',
    targetNodeId: 'house-1',
    backConnectionId: 'master-house-1'
  });

  assert.deepEqual(action, {
    type: 'play-forward',
    connectionId: 'master-house-1',
    targetNodeId: 'house-1'
  });

  controller.handleForwardEnded();

  assert.equal(controller.getState().mode, 'node');
  assert.equal(controller.getState().currentNodeId, 'house-1');
  assert.equal(controller.getState().backVisible, true);
});

test('back from house 2 goes to master even if the user arrived there from house 1', () => {
  const controller = createHeroController({ reverseBlendWindow: 0.25 });

  controller.handleConnectionClick({
    connectionId: 'master-house-1',
    targetNodeId: 'house-1',
    backConnectionId: 'master-house-1'
  });
  controller.handleForwardEnded();

  controller.handleConnectionClick({
    connectionId: 'between-houses',
    targetNodeId: 'house-2',
    backConnectionId: 'master-house-2'
  });
  controller.handleForwardEnded();

  assert.equal(controller.getState().currentNodeId, 'house-2');

  const backAction = controller.handleBackClick();
  assert.deepEqual(backAction, {
    type: 'play-reverse',
    connectionId: 'master-house-2',
    targetNodeId: 'master'
  });

  controller.handleReverseProgress(0.2);
  assert.equal(controller.getState().reverseBlendActive, true);

  controller.handleReverseComplete();
  assert.equal(controller.getState().currentNodeId, 'master');
  assert.equal(controller.getState().backVisible, false);
});
